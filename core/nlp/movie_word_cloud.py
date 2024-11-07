import os
import pandas as pd
import requests
import configparser
from bs4 import BeautifulSoup as bs
from collections import Counter
from tqdm import tqdm

from sklearn.feature_extraction.text import CountVectorizer

# es
from esUtil import ElasticSearchClient, ElasticSearchHelper
# okt
from konlpy.tag import Okt


CONFIG_DIR = '/conf/word_cloud.properties'

def get_config():
    pwd = os.path.dirname(os.path.realpath(__file__))
    config = configparser.RawConfigParser()
    config.read(pwd + CONFIG_DIR)
    return config


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

    client.clear_scroll({'scroll_id': old_scroll_id})

    return result


def word_cloud(es_info):

    # okt
    okt = Okt()

    # es
    es_client = ElasticSearchClient(host=es_info['host'], port=es_info['port'])
    client = es_client.getClient()

    scroll_body = {
        "size": 100,
        "query": {
            "match_all": {}
        }
    }

    movie_list = scrollAPI(client, es_info['movie_index'], scroll_body)

    stopwords = ['의', '가', '이', '은', '들', '는', '좀', '잘',
                '걍', '과', '도', '를', '으로', '자', '에', '와', '한', '하다']

    for movie in movie_list:
        movie_id = movie['movie_id']

        review_body = {
            "size": 100,
            "query": {
                "match": {
                    'movie_id': movie_id
                }
            }
        }

        movie_reviews = scrollAPI(client, es_info['review_index'], review_body)
        result = [movie_review['review_txt'] for movie_review in movie_reviews]

        if len(result) < 10:
            # print(movie['movie_id'])
            continue

        doc = ' '.join(result)
        tokenized_doc = okt.pos(doc)

        try:
            tokenized_nouns = ' '.join(
                [word[0] for word in tokenized_doc if word[1] == 'Noun'])
        except:
            pass
        """
        count = Counter(tokenized_nouns)

        wc_list = [str(x[0])+'_'+str(x[1]) for x in count.most_common(100)]
        """

        words_freq_list = []
        #n_gram_range = (2, 3)

        #vec = CountVectorizer(ngram_range=n_gram_range).fit([tokenized_nouns])
        vec = CountVectorizer(stop_words=stopwords).fit([tokenized_nouns])
        bag_of_words = vec.transform([tokenized_nouns])
        sum_words = bag_of_words.sum(axis=0)
        words_freq = [(word, sum_words[0, idx])
                    for word, idx in vec.vocabulary_.items()]
        words_freq = sorted(words_freq, key=lambda x: x[1], reverse=True)

        wc_dic = {}
    
        wc_dic['movie_id'] = movie['movie_id']
        for word_freq in words_freq:
            words_freq_list.append(word_freq[0] + '__' + str(word_freq[1]))

        wc_dic['word_cloud'] = words_freq_list[:100]

        client.index(index=es_info['bulk_index'], id=movie['movie_id'], body=wc_dic)

if __name__ == "__main__":
    #get config
    config = get_config()
    es_info = dict(config.items('Elasticsearch'))

    word_cloud(es_info)