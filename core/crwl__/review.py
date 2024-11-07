import os
import pandas as pd
import requests
from requests.utils import requote_uri
from bs4 import BeautifulSoup as bs


from esUtil import ElasticSearchClient, ElasticSearchHelper

import configparser
import math
import time


FILE_DIR = './data/movieList.xls'
CONFIG_DIR = '/conf/review.properties'
LIST_BATCH_SIZE = 300

QUERY_URL = 'https://movie.naver.com/movie/search/result.naver?section=all&ie=utf8&query='
REVIEW_PAGE_URL = 'https://movie.naver.com/movie/bi/mi/pointWriteFormList.naver'
USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.47 Safari/537.36'
HEADERS = {'User-Agent': USER_AGENT}


def get_config():
    pwd = os.path.dirname(os.path.realpath(__file__))
    config = configparser.RawConfigParser()
    config.read(pwd + CONFIG_DIR)
    return config

# list batch
def batch(iterable, batch_size=LIST_BATCH_SIZE):
    l = len(iterable)
    for ndx in range(0, l, batch_size):
        yield iterable[ndx:min(ndx + batch_size, l)]

# get html
def requests_url_get_html(url):
    url = requote_uri(url)
    response = requests.get(url, headers=HEADERS)
    html = response.content
    return html

# get movie_id
def crwl_movie_info(url):
    html = requests_url_get_html(url)
    soup = bs(html, 'html.parser')
    movie_ul = soup.select('#old_content > ul.search_list_1')
    movie_id = movie_ul[0].select_one('li > p > a')['href'].split('?code=')[1]
    movie_score = 0

    try:
        movie_score = movie_ul[0].select_one('li > dl > dd > em.num').text
    except:
        pass

    return movie_id, movie_score


def crwl_review_to_es(movie_info, es_info):

    es_client = ElasticSearchClient(host=es_info['host'], port=es_info['port'])
    es_client = es_client.getClient()
    es_helper = ElasticSearchHelper(es_client)

    es_index = es_info['bulk_index']
    es_index_key = es_info['key']

    movie_id = movie_info['movie_id']
    movie_score = movie_info['score_avg']

    page = 1
    total_page = 1

    while True:
        review_url = REVIEW_PAGE_URL + '?code=' + \
            movie_id + '&page=' + str(page)

        html = requests_url_get_html(review_url)
        soup = bs(html, 'html.parser')
        total = 0

        try:
            total = int(soup.select_one(
                'body > div > div > div.score_total > strong > em').text)
            total_page = math.ceil(total/10)
        except:
            break

        # review crwl
        review_result = soup.select('.score_result > ul > li')

        review_data = []

        for review in review_result:
            #review_dic = movie_info
            review_dic = {}
            review_score = int(review.select_one('.star_score > em').text)

            #review_people = review.select_one('.score_reple')
            review_txt = review.select_one('p').text.replace(
                '관람객', '').replace('\n', '').strip()

            review_dt = review.select('dl > dt > em')

            review_id = movie_id+"__" + \
                review_dt[0].text.replace('\n', '').strip()
            review_date = review_dt[1].text

            if not review_id:
                continue

            review_dic['movie_id'] = movie_id
            review_dic['movie_avg_score'] = movie_score
            review_dic['review_score'] = review_score
            review_dic['review_id'] = review_id
            review_dic['review_txt'] = review_txt
            review_dic['review_date'] = review_date

            review_data.append(review_dic)

        # es insert!!
        es_helper.indexBulk(es_index, review_data, es_index_key)

        if total_page <= page:
            break
        else:
            time.sleep(0.3)
            page += 1


def get_es_data_scrollAPI(es_info):

    es_client = ElasticSearchClient(host=es_info['host'], port=es_info['port'])
    es_client = es_client.getClient()
    index = es_info['search_index']

    resp = es_client.search(
        index= index,
        body={
            "size": 100,
            "query": {
                "match_all": {}
            }
        },
        scroll='1s'
    )

    old_scroll_id = resp['_scroll_id']

    result = []

    for doc in resp['hits']['hits']:
        result.append(doc['_source'])

    while len(resp['hits']['hits']):
        es_client.info
        resp = es_client.scroll(
            scroll_id=old_scroll_id,
            scroll='1s' 
        )
        old_scroll_id = resp['_scroll_id']
        for doc in resp['hits']['hits']:
            result.append(doc['_source'])

    #clear scroll
    es_client.clear_scroll(scroll_id=old_scroll_id)

    return result


if __name__ == "__main__":

    #get config
    config = get_config()

    #get data
    es_info = dict(config.items('Elasticsearch'))
    movie_data = get_es_data_scrollAPI(es_info)

    #crwl review
    for movie_info in movie_data:
        crwl_review_to_es(movie_info, es_info)
