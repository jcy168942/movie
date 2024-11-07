import os
import configparser
import pandas as pd
import numpy as np
import re
import urllib.request
from konlpy.tag import Okt
from tqdm import tqdm
import pickle

# es
from esUtil import ElasticSearchClient, ElasticSearchHelper
from elasticsearch import Elasticsearch, helpers, exceptions
from elasticsearch.helpers import bulk as es_bulk

# tensor
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.layers import Embedding, Dense, LSTM
from tensorflow.keras.models import Sequential
from tensorflow.keras.models import load_model
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint


MAX_LEN = 30
LIST_BATCH_SIZE = 100
CONFIG_DIR = '/conf/sentiment.properties'

STOP_WORDS = ['의', '가', '이', '은', '들', '는', '좀', '잘',
                '걍', '과', '도', '를', '으로', '자', '에', '와', '한', '하다']


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

    return result

 

def sentiment_predict(tokenizer, okt, loaded_model, new_sentence):
    new_sentence = re.sub(r'[^ㄱ-ㅎㅏ-ㅣ가-힣 ]', '', new_sentence)
    new_sentence = okt.morphs(new_sentence, stem=True)  # 토큰화
    new_sentence = [
        word for word in new_sentence if not word in STOP_WORDS]  # 불용어 제거
    encoded = tokenizer.texts_to_sequences([new_sentence])  # 정수 인코딩
    pad_new = pad_sequences(encoded, maxlen=MAX_LEN)  # 패딩
    score = float(loaded_model.predict(pad_new, verbose=0))  # 예측
    positive = True
            
    if score > 0.6:
        positive = True
        score = score * 100
    else:
        positive = False
        score = (1 - score) * 100
 
    return positive, score

# list batch


def batch(iterable, batch_size=LIST_BATCH_SIZE):
    l = len(iterable)
    for ndx in range(0, l, batch_size):
        yield iterable[ndx:min(ndx + batch_size, l)]



def sentiment(es_info):

    es_client = ElasticSearchClient(host=es_info['host'], port=es_info['port'])
    client = es_client.getClient()
    es_helper = ElasticSearchHelper(client)

    okt = Okt()

    with open('./data/train.pickle', 'rb') as f:
        X_train = pickle.load(f)


    tokenizer = Tokenizer()
    tokenizer.fit_on_texts(X_train)

    threshold = 3
    total_cnt = len(tokenizer.word_index)
    rare_cnt = 0
    total_freq = 0
    rare_freq = 0

    for key, value in tokenizer.word_counts.items():
        total_freq = total_freq + value

        if(value < threshold):
            rare_cnt = rare_cnt + 1
            rare_freq = rare_freq + value


    vocab_size = total_cnt - rare_cnt + 1

    tokenizer = Tokenizer(vocab_size)
    tokenizer.fit_on_texts(X_train)

    # model load
    loaded_model = load_model('./model/best_model.h5')

    scroll_body = {
        "size": 100,
        "query": {
            "match_all": {}
        }
    }

    review_list = scrollAPI(client, es_info['review_index'], scroll_body)

    sentiment_result = []
    for review in batch(review_list):
        review_dic = review
        positive, score = sentiment_predict(tokenizer, okt, loaded_model, review['review_txt'])
        review_dic['review_positive'] = positive
        review_dic['review_sentiment_score'] = score
        #sentiment_result.append(review_dic)
        es_helper.indexBulk(es_info['bulk_index'], [review_dic], es_info['bulk_index_key'])


    # es insert
    #for result in batch(sentiment_result):
    #    es_helper.indexBulk(es_info['bulk_index'], result, es_info['bulk_index_key'])



if __name__ == "__main__":
    #get config
    config = get_config()
    es_info = dict(config.items('Elasticsearch'))

    sentiment(es_info)