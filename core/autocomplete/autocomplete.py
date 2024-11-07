from elasticsearch import Elasticsearch, exceptions
from elasticsearch.helpers import bulk as es_bulk
import elasticsearch



es_client = Elasticsearch('http://192.168.0.110:9200')


resp = es_client.search(
        index= 'movie',
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

requests = []
for row in result:
    #print(row)
    dic = {}
    dic['movie_id'] = row['movie_id']
    dic['h_movie'] = row['h_movie']
    dic['h_movie2'] = row.get('h_movie2')
    dic['h_movie3'] = row.get('h_movie')
    dic['h_movie4'] = row.get('h_movie2')
    dic['movie_poster'] = row.get('movie_poster')
    request = {
                '_index': 'auto_complete_movie',
                '_source': dic
            }
    requests.append(request)

es_bulk(es_client, requests)

print('bulk end')