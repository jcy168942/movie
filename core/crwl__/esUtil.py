from elasticsearch import Elasticsearch, exceptions
from elasticsearch.helpers import bulk as es_bulk
import elasticsearch


class ElasticSearchClient(object):

    def __init__(self, host, port):
        self.host = host
        self.port = port

    def getClient(self):
        client_url = "http://"+self.host+":"+self.port
        es_client = Elasticsearch(client_url)
        return es_client


class ElasticSearchHelper(object):

    def __init__(self, es_client):
        self.es_client = es_client

    def checkIndex(self, es_index):
        try:
            self.es_client.indices.get(es_index)
            return True
        except:
            return False

    def deleteIndex(self, es_index):
        try:
            self.es_client.indices.delete(es_index)
            return True
        except:
            return False

    def createIndex(self, es_index, reqBody=None):
        try:
            if reqBody:
                self.es_client.indices.create(es_index, reqBody)
            else:
                self.es_client.indices.create(es_index)
            return True
        except:
            return False

    def indexBulk(self, index, rows, key):

        requests = []
        for row in rows:
            request = {
                '_index': index,
                '_id': row[key],
                '_source': row
            }
            requests.append(request)

        try:
            es_bulk(self.es_client, requests)
        except exceptions.ConnectionTimeout as e:
            print('new connection retry...')
            client = ElasticSearchClient().getClient()
            es_bulk(client, requests)

        return False
