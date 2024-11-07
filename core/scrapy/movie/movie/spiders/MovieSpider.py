from operator import le
import scrapy
from bs4 import BeautifulSoup as bs
import math
import time
import re
from movie.items import MovieItem, MovieReviewItem
from movie.util.esUtil import ElasticsearchUtil
from scrapy.utils.project import get_project_settings

class MovieSpider(scrapy.Spider):
    name = "movie"
    
    BASIC_URL = 'https://movie.naver.com/movie/bi/mi/basic.naver?code=' 
    DETAIL_URL = 'https://movie.naver.com/movie/bi/mi/detail.naver?code='
    PHTOTO_URL = 'https://movie.naver.com/movie/bi/mi/photoView.naver?code=' 
    VIDEO_URL = 'https://movie.naver.com/movie/bi/mi/media.naver?code=' 
    REVIEW_URL = 'https://movie.naver.com/movie/bi/mi/pointWriteFormList.naver?code='
    
    
    def __init__(self, name=None, code=None , **kwargs):
        super().__init__(name, **kwargs)
    

    def start_requests(self):
        
        
        crwl_type = self.__dict__.get('type')
        movie = []
        
        settings=get_project_settings()
        es_dev_server = settings.get('ELASTICSEARCH_DEV_SERVERS')
        #es_local_server = settings.get('ELASTICSEARCH_LOCAL_SERVERS')
        
        if crwl_type == 'bulk':
            #ElasticsearchUtil.create_index_mapping(es_local_server)
            ElasticsearchUtil.bulk_data(es_dev_server)
            print('movie bulk start')
            movie = ElasticsearchUtil.get_es_data_scrollAPI('movie',es_dev_server)
            #print(len(movie))
        else:
            crwl_type = 'crwl'
            #movie = ElasticsearchUtil.get_es_data_scrollAPI('crwl_movie', es_local_server)
            

        for code in movie:
            code = str(code)
            #movie crwl
            yield scrapy.Request(url=self.BASIC_URL+code, meta={'code': code, 'crwl_type': crwl_type}, callback=self.crwl_movie_basic)
            #movie review crwl
            yield scrapy.Request(url=self.REVIEW_URL+code, meta={'code': code }, callback=self.crwl_movie_review)   
            
    def crwl_movie_basic(self, response):
        item = MovieItem()
        item['movie_id'] = response.meta['code']
        item['crwl_type'] = response.meta['crwl_type']
        soup = bs(response.body, 'html.parser')
        
        try:
            movie_detail = soup.select_one('#content > div.article > div.mv_info_area > div.mv_info')
            poster = soup.select_one('#content > div.article > div.mv_info_area > div.poster')
            
            #movie story
            try:
                movie_story = soup.select_one('#content > div.article > div.section_group > div > div > div > p.con_tx').text
                item['movie_story'] = movie_story
            except:
                pass
            
            #h_movie
            h_movie = movie_detail.select_one('h3.h_movie > a')
            item['h_movie'] = h_movie.text.replace('\n','')
            item['h_movie3'] = item['h_movie']
            
            #h_movie2
            h_movie2 = movie_detail.select_one('strong.h_movie2')
            if h_movie2:
                if h_movie2.find(",") != -1:
                    h_movie2 = h_movie2.text.split(",")[:-1]
                    h_movie2 = ",".join([re.sub('(?:[0-9]{2})', '', movie) for movie in h_movie2])
                    item['h_movie2'] = h_movie2
                    
            #score
            try:
                movie_score = movie_detail.select_one('div.main_score')
                score_cnt = 3

                actual_score = movie_score.select('div.score > #actualPointPersentBasic > div.star_score > em')
                if actual_score:
                    actual_score = "".join([score.text for score in actual_score])
                else:
                    actual_score = 0.0
                    score_cnt -= 1
                
                spc_score = movie_score.select('div.score > div.spc_score_area > a > div > em')
                if spc_score:
                    spc_score = "".join([score.text for score in spc_score])
                else:
                    spc_score = 0.0
                    score_cnt -= 1

                ntz_score = movie_score.select('div.score > div.star_score > #pointNetizenPersentBasic > em')
                if ntz_score:
                    ntz_score = "".join([score.text for score in ntz_score])
                else:
                    ntz_score = 0.0
                    score_cnt -= 1

                score_avg = (float(actual_score) + float(spc_score) + float(ntz_score)) / score_cnt
            except:
                actual_score = 0.0
                spc_score = 0.0
                ntz_score = 0.0
                score_avg = 0.0
            
            item['score_avg'] = score_avg 


            ##청불 check
            grade_flag = True
            try:
                movie_a_spec = movie_detail.select_one('dl.info_spec').text
                if movie_a_spec.find('청소년 관람불가') != -1:
                    grade_flag = False
            except:
                pass
            
            if not grade_flag:
                raise Exception('청불영화...')
                
            try:
                movie_info = movie_detail.select('dl.info_spec > dd')
                movie_spec = movie_info[0].select('p > span')

                poster_img = ''
                poster_img = poster.select_one('a > img')['src']
                
                item['movie_poster'] = poster_img
                
                movie_genre = []
                movie_nation = []
                movie_open = []
                show_time = 0
                for spec in movie_spec:

                    if spec.text.find('분') != -1:
                        show_time = spec.text.replace('분','').strip()

                    a = spec.select('a')
                    for href in a:
                        if href['href'].find('/movie/sdb/browsing/bmovie.naver?genre=') != -1:
                            movie_genre.append(href.text)
                        if href['href'].find('/movie/sdb/browsing/bmovie.naver?nation=') != -1:
                            movie_nation.append(href.text)
                        if href['href'].find('/movie/sdb/browsing/bmovie.naver?open=') != -1:
                            movie_open.append(href.text)

                item['genre'] = movie_genre
                item['nation'] = movie_nation
                item['show_time'] = show_time

                if len(movie_open) >= 4:
                    new_open = str(movie_open[0]+movie_open[1]).strip()
                    old_open = str(movie_open[2]+movie_open[3]).strip()
                    movie_open = [new_open, old_open]
                else:
                    movie_open = "".join(movie_open).strip()

                if movie_open:
                    item['opening_date'] = movie_open
                else:
                    item['opening_date'] = None
                
            except:
                pass
        except Exception as e:
            item['exception'] = str(e)
        else:
            yield scrapy.Request(url=self.DETAIL_URL+item['movie_id'], meta={'meta_item': item}, callback=self.crwl_movie_detail)
            
    
    def crwl_movie_detail(self, response):
        item = response.meta['meta_item']
        soup = bs(response.body, 'html.parser')
        movie_detail = soup.select_one('#content > div.article > div.section_group.section_group_frst')

        
        try:
            #배우
            movie_actor_div = movie_detail.select('.made_people > .lst_people_area > ul > li')
            movie_actors = []
            for actor_div in movie_actor_div:
                actor_dic = {}

                actor_info = actor_div.select_one('div')
                actor_thumb = actor_div.select_one('p > a > img')['src']

                actor_name = actor_info.select_one('a').text
                actor_part = actor_info.select_one('.part > .in_prt > .p_part').text.strip().replace('\n','')

                actor_dic['name'] = actor_name
                actor_dic['part'] = actor_part
                actor_dic['thumb'] = actor_thumb

                movie_actors.append(actor_dic)

            item['movie_actor'] = movie_actors
            #감독
            movie_director_thumb = movie_detail.select_one('.obj_section > .director > .dir_obj > p > a > img')['src']
            movie_director = movie_detail.select_one('.obj_section > .director > .dir_obj > .dir_product > a').text
            item['movie_director'] = movie_director
            item['movie_director_thumb'] = movie_director_thumb
        except:
            item['movie_actor'] = []
            item['movie_director'] = ''
            item['movie_director_thumb'] = ''
            pass
    
        yield scrapy.Request(url=self.VIDEO_URL+item['movie_id'], meta={'meta_item': item}, callback=self.crwl_movie_video)
    
    def crwl_movie_video(self, response):
        item = response.meta['meta_item']
        soup = bs(response.body, 'html.parser')

        video_thumb_list = soup.select('#content > div.article > div.obj_section2.noline > div > div.ifr_module > div > div > ul > li')

        video_list = []
        for video in video_thumb_list:
            video_list.append(video.select_one('a')['href'])
        
        item['movie_video'] = video_list
        yield scrapy.Request(url=self.PHTOTO_URL+item['movie_id'], meta={'meta_item': item}, callback=self.crwl_movie_photo)
    
    def crwl_movie_photo(self, response):
        
        item = response.meta['meta_item']
        soup = bs(response.body, 'html.parser')

        photo_roll = soup.select('#photo_area > div > div.list_area._list_area > div > ul > li')

        photo_list = []
        for photo in photo_roll:
            photo_img = photo.select_one('a > img')['src']
            photo_list.append(photo_img)
        
        item['movie_photo'] = photo_list
        
        yield item
    
    def crwl_movie_review(self, response):
        item = MovieReviewItem()
        item['movie_id'] = response.meta['code']
        
        page = 1
        total_page = 1
        total = 0
        
        soup = bs(response.body, 'html.parser')
        try:
            total = int(soup.select_one(
                'body > div > div > div.score_total > strong > em').text)
            total_page = math.ceil(total/10)
            
            while True:
                review_url = self.REVIEW_URL+ item['movie_id'] + '&page=' + str(page)
                
                ##sleep
                time.sleep(0.1)
                yield scrapy.Request(url=review_url, meta={'meta_item': item}, callback=self.crwl_movie_review_page)
                
                if total_page <= page:
                    break
                else:
                    page += 1
                
        except:
            pass
    
    def crwl_movie_review_page(self, response):
        
        item = response.meta['meta_item']
        soup = bs(response.body, 'html.parser')
        
        # review crwl
        review_result = soup.select('.score_result > ul > li')
        
        for review in review_result:
            review_score = int(review.select_one('.star_score > em').text)

            review_txt = review.select_one('p').text.replace(
                '관람객', '').replace('\n', '').strip()

            review_dt = review.select('dl > dt > em')

            review_id = item['movie_id']+"__" + \
                review_dt[0].text.replace('\n', '').strip()
            review_date = review_dt[1].text

            if not review_id:
                continue

            item['review_score'] = review_score
            item['review_id'] = review_id
            item['review_txt'] = review_txt
            item['review_date'] = review_date
            
            yield item