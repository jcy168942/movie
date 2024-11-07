import elasticsearch
from elasticsearch import Elasticsearch, exceptions
from elasticsearch.helpers import bulk as es_bulk
import requests
import json
import os
import sys
import platform
from kafka.producer import KafkaProducer


class ElasticsearchUtil():
    
    def __str__(self):
        return ""
    
    
    def create_index_mapping(es_server):
        print("template put start")
        template_list = ['movie','auto_complete_movie']
        
        headers={'Accept': 'application/json', 'Content-type': 'application/json'}
        
        for temp in template_list:
            if platform.system() == 'Windows':
                tem_path = os.getcwd()+"\\movie\\template\\"+temp+".json"
            else:
                tem_path = os.getcwd()+"/movie/template/"+temp+".json"
            with open(tem_path) as json_file:
                data = json.load(json_file)
            
            requests.put(es_server[0]+'/_index_template/'+temp, data=json.dumps(data),headers=headers)
        
        print("template put end")
        return None
    
    def bulk_data(es_server):
        print('auto bulk start')
        
        def scroll_data(es_server, index):
            es_client = Elasticsearch(es_server)
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
        
        producer = KafkaProducer(acks=0, compression_type='gzip', bootstrap_servers=['localhost:9092'],
                         value_serializer=lambda x: json.dumps(x).encode('utf-8'))
        
        
        auto_result = scroll_data(es_server, 'auto_complete_movie')
        sentiment_result = scroll_data(es_server, 'review_sentiment')
        word_cloud_result = scroll_data(es_server, 'movie_word_cloud')
        
        for row in auto_result:
            dic = {}
            dic['movie_id'] = row['movie_id']
            dic['h_movie'] = row['h_movie']
            dic['h_movie2'] = row.get('h_movie2')
            dic['h_movie3'] = row.get('h_movie')
            dic['h_movie4'] = row.get('h_movie2')
            dic['movie_poster'] = row.get('movie_poster')
            producer.send('auto_movie', dic)
        
        for row in word_cloud_result:
            producer.send('word_cloud', row)

        for row in sentiment_result:
            producer.send('sentiment', row)

    def crwl_delete_movie_id(id, es_server):
        es_client = Elasticsearch(es_server)
        
        body = {
                "query": {
                    "match": {
                    "movie_id": id
                    }
                }
                }
        
        try:
            es_client.delete_by_query(index='crwl_movie', body=body)
        except elasticsearch.exceptions.ConflictError:
            pass
        except Exception as e:
            raise Exception
            
    
    def get_es_data_scrollAPI(index, es_server):

        es_client = Elasticsearch(es_server)

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
            result.append(doc['_source']['movie_id'])

        while len(resp['hits']['hits']):
            es_client.info
            resp = es_client.scroll(
                scroll_id=old_scroll_id,
                scroll='1s' 
            )
            old_scroll_id = resp['_scroll_id']
            for doc in resp['hits']['hits']:
                result.append(doc['_source']['movie_id'])

        #clear scroll
        es_client.clear_scroll(scroll_id=old_scroll_id)
    
        return result