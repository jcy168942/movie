from asyncio.log import logger
from json import dumps
from functools import partial
from .util.esUtil import ElasticsearchUtil

from kafka.client_async import KafkaClient
from kafka.producer import KafkaProducer


class KafkaPipeline(object):
    def __init__(self, producer, topic, es_local_server):
        self.es_local_server = es_local_server
        self.producer = producer
        
    def process_item(self, item, spider):
        item = dict(item)
        item['spider'] = spider.name
        movie_id = item['movie_id']
        crwl_type = None
        try:
            future = None
            if not item.get('exception'):
                if item.get('review_id'):
                    #insert review
                    future = self.producer.send('review01', item).add_callback(self.on_send_success)
                else:
                    #insert movie
                    crwl_type = item.get('crwl_type')
                    future = self.producer.send('movie01', item).add_callback(self.on_send_success)
                    
                record_metadata = future.get(5000)
                
                if not record_metadata:
                    raise Exception
            else:
                #print(item.get('exception'))
                pass
        except Exception as e:
            logger.log(e)
        else:
            if crwl_type == 'crwl' and not item.get('review_id'):
                pass
                #ElasticsearchUtil.crwl_delete_movie_id(movie_id, self.es_local_server)
            pass
        
        
    def on_send_success(self, record_metadata):
        pass
        

    def close_spider(self, spider):
        self.producer.flush()   

    @classmethod
    def from_settings(cls, settings):
        topic = settings.get('KAFKA_PRODUCER_MOVIE_TOPIC', 'movie01')
        es_local_server = settings.get('ELASTICSEARCH_LOCAL_SERVERS')
        producer = KafkaProducer(acks=0, compression_type='gzip', bootstrap_servers=['localhost:9092'],
                         value_serializer=lambda x: dumps(x).encode('utf-8'))
        
        return cls(producer, topic, es_local_server)