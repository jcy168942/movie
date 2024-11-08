import math
import os
import configparser
import numpy as np
import itertools
import math

from esUtil import ElasticSearchClient

from konlpy.tag import Okt
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer


CONFIG_DIR = '/conf/keyword.properties'

def get_config():
    pwd = os.path.dirname(os.path.realpath(__file__))
    config = configparser.RawConfigParser()
    config.read(pwd + CONFIG_DIR)
    return config

def max_sum_sim(doc_embedding, candidate_embeddings, candidates, top_n, nr_candidates):
    # 문서와 각 키워드들 간의 유사도
    distances = cosine_similarity(doc_embedding, candidate_embeddings)

    # 각 키워드들 간의 유사도
    distances_candidates = cosine_similarity(candidate_embeddings,
                                             candidate_embeddings)

    # 코사인 유사도에 기반하여 키워드들 중 상위 top_n개의 단어를 pick.
    words_idx = list(distances.argsort()[0][-nr_candidates:])
    words_vals = [candidates[index] for index in words_idx]
    distances_candidates = distances_candidates[np.ix_(words_idx, words_idx)]

    # 각 키워드들 중에서 가장 덜 유사한 키워드들간의 조합을 계산
    min_sim = np.inf
    candidate = None
    for combination in itertools.combinations(range(len(words_idx)), top_n):
        sim = sum([distances_candidates[i][j]
                  for i in combination for j in combination if i != j])
        if sim < min_sim:
            candidate = combination
            min_sim = sim

    return [words_vals[idx] for idx in candidate]


def mmr(doc_embedding, candidate_embeddings, words, top_n, diversity):

    # 문서와 각 키워드들 간의 유사도가 적혀있는 리스트
    word_doc_similarity = cosine_similarity(
        candidate_embeddings, doc_embedding)

    # 각 키워드들 간의 유사도
    word_similarity = cosine_similarity(candidate_embeddings)

    # 문서와 가장 높은 유사도를 가진 키워드의 인덱스를 추출.
    # 만약, 2번 문서가 가장 유사도가 높았다면
    # keywords_idx = [2]
    keywords_idx = [np.argmax(word_doc_similarity)]

    # 가장 높은 유사도를 가진 키워드의 인덱스를 제외한 문서의 인덱스들
    # 만약, 2번 문서가 가장 유사도가 높았다면
    # ==> candidates_idx = [0, 1, 3, 4, 5, 6, 7, 8, 9, 10 ... 중략 ...]
    candidates_idx = [i for i in range(len(words)) if i != keywords_idx[0]]

    # 최고의 키워드는 이미 추출했으므로 top_n-1번만큼 아래를 반복.
    # ex) top_n = 5라면, 아래의 loop는 4번 반복됨.
    for _ in range(top_n - 1):
        candidate_similarities = word_doc_similarity[candidates_idx, :]
        target_similarities = np.max(
            word_similarity[candidates_idx][:, keywords_idx], axis=1)

        # MMR을 계산
        mmr = (1-diversity) * candidate_similarities - \
            diversity * target_similarities.reshape(-1, 1)
        mmr_idx = candidates_idx[np.argmax(mmr)]

        # keywords & candidates를 업데이트
        keywords_idx.append(mmr_idx)
        candidates_idx.remove(mmr_idx)

    return [words[idx] for idx in keywords_idx]


def scrollAPI(client, index, body):

    resp = client.search(
        index=index,
        body=body,
        scroll='1s'
    )

    old_scroll_id = resp['_scroll_id']

    result = []

    for doc in resp['hits']['hits']:
        result.append(doc['_source'])

    while len(resp['hits']['hits']):
        resp = client.scroll(
            scroll_id=old_scroll_id,
            scroll='1s'
        )
        old_scroll_id = resp['_scroll_id']
        for doc in resp['hits']['hits']:
            result.append(doc['_source'])

    return result



def keyword_extract(es_info, keyword_info):

    mm_top_n = int(keyword_info['top_n'])
    mms_candidates = int(keyword_info['mms_candidates'])
    mmr_diversity = float(keyword_info['mmr_diversity'])

    es_client = ElasticSearchClient(host=es_info['host'], port=es_info['port'])
    client = es_client.getClient()

    okt = Okt()

    scroll_body = {
        "size": 100,
        "query": {
            "match_all": {}
        }
    }

    movie_list = scrollAPI(client, es_info['movie_index'], scroll_body)


    for movie in movie_list:

        review_body = {
            "size": 100,
            "query": {
                "match": {
                    'movie_id': movie['movie_id']
                }
            }
        }

        movie_reviews = scrollAPI(client, es_info['review_index'], review_body)

        result = [movie_review['review_txt'] for movie_review in movie_reviews]

        keyword_extract = {}

        top_n = int(len(result) / 100)

        if top_n < 1:
            top_n = 2
        elif top_n > mm_top_n:
            top_n = mm_top_n + 1


        if len(result) >= 10:

            keyword_extract['movie_id'] = movie['movie_id']

            doc = ' '.join(result)

            tokenized_doc = okt.pos(doc)
            tokenized_nouns = ' '.join(
                [word[0] for word in tokenized_doc if word[1] == 'Noun'])

            n_gram_range = (1, 3)

            count = CountVectorizer(
                ngram_range=n_gram_range).fit([tokenized_nouns])
            candidates = count.get_feature_names_out()

            model = SentenceTransformer(
                'sentence-transformers/xlm-r-100langs-bert-base-nli-stsb-mean-tokens')
            doc_embedding = model.encode([doc])
            candidate_embeddings = model.encode(candidates)

            distances = cosine_similarity(doc_embedding, candidate_embeddings)
            keywords = [candidates[index]
                        for index in distances.argsort()[0][-top_n:]]

            keyword_extract['mms_candidates'] = max_sum_sim(
                doc_embedding, candidate_embeddings, candidates, top_n=top_n, nr_candidates=mms_candidates)

            keyword_extract['mmr_diversity_'+str(mmr_diversity)] = mmr(
                doc_embedding, candidate_embeddings, candidates, top_n=top_n, diversity=mmr_diversity)

            keyword_extract['cosine_sim_keywords'] = keywords

        try:
            if not keyword_extract:
                continue
            client.index(index=es_info['bulk_index'],
                        id=movie['movie_id'], body=keyword_extract)
        except:
            print('nobulk'+movie)



if __name__ == "__main__":
    #get config
    config = get_config()
    es_info = dict(config.items('Elasticsearch'))
    keyword_info = dict(config.items('Keyword'))

    keyword_extract(es_info, keyword_info)