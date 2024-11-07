import os
import pandas as pd
import requests
from requests.utils import requote_uri
from bs4 import BeautifulSoup as bs
from esUtil import ElasticSearchClient, ElasticSearchHelper
import configparser

from tqdm import tqdm

FILE_DIR = './data/movieList.xls'
CONFIG_DIR = '/conf/movie.properties'
LIST_BATCH_SIZE = 5

QUERY_URL = 'https://movie.naver.com/movie/search/result.naver?section=all&ie=utf8&query='
BASIC_URL = 'https://movie.naver.com/movie/bi/mi/basic.naver?code='
DETAIL_URL = 'https://movie.naver.com/movie/bi/mi/detail.naver?code='
PHTOTO_URL = 'https://movie.naver.com/movie/bi/mi/photoView.naver?code='
VIDEO_URL = 'https://movie.naver.com/movie/bi/mi/media.naver?code='

USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.47 Safari/537.36'
HEADERS = {'User-Agent': USER_AGENT}


def get_config():
    pwd = os.path.dirname(os.path.realpath(__file__))
    config = configparser.RawConfigParser()
    config.read(pwd + CONFIG_DIR)
    return config

def get_movie_data():
    #dataframe excel
    df = pd.read_excel(FILE_DIR, sheet_name= '영화정보 리스트', header=4)
    df.rename(columns = {'영화명':'movie', '영화명(영문)':'movie_en', '제작연도':'year', '제작국가':'nation', '장르':'genre', '제작상태':'state'}, inplace = True)
    movie_data = df[['movie','movie_en','year','nation','genre','state']].fillna('').to_dict('records')
    return movie_data

#list batch
def batch(iterable, batch_size=LIST_BATCH_SIZE):
    l = len(iterable)
    for ndx in range(0, l, batch_size):             
        yield iterable[ndx:min(ndx + batch_size, l)] 

# get html
def requests_url_get_html(url):
    url = requote_uri(url)
    response = requests.get(url,headers=HEADERS)
    html = response.content
    return html

# get movie_id
def crwl_movie_id(url):
    html = requests_url_get_html(url)
    soup = bs(html, 'html.parser')
    movie_ul = soup.select('#old_content > ul.search_list_1')
    movie_id = movie_ul[0].select_one('li > p > a')['href'].split('?code=')[1]

    return movie_id

# crwl movie_basic
def crwl_movie_basic(movie_id):
    basic_dic = {}
    html = requests_url_get_html(BASIC_URL + movie_id)
    soup = bs(html, 'html.parser')

    try:
        movie_detail = soup.select_one('#content > div.article > div.mv_info_area > div.mv_info')
        poster = soup.select_one('#content > div.article > div.mv_info_area > div.poster')
        
        #movie story
        movie_story = soup.select_one('#content > div.article > div.section_group > div > div > div > p.con_tx').text
        basic_dic['movie_story'] = movie_story
        
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
        

        #basic_dic['actual_score'] = actual_score
        #basic_dic['spc_score'] = spc_score
        #basic_dic['ntz_score'] = ntz_score
        basic_dic['score_avg'] = score_avg 


        movie_info = movie_detail.select('dl.info_spec > dd')
        movie_spec = movie_info[0].select('p > span')

        poster_img = ''
        try:
            poster_img = poster.select_one('a > img')['src']
        except:
            pass
        basic_dic['movie_img'] = poster_img
        
        movie_genre = []
        movie_nation = []
        movie_open = []
        show_time = ''
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

        basic_dic['genre'] = movie_genre
        basic_dic['nation'] = movie_nation
        basic_dic['show_time'] = show_time

        if len(movie_open) >= 4:
            new_open = str(movie_open[0]+movie_open[1]).strip()
            old_open = str(movie_open[2]+movie_open[3]).strip()
            movie_open = [new_open, old_open]
        else:
            movie_open = "".join(movie_open).strip()

        basic_dic['opening_date'] = movie_open
    except Exception as e:
        return None

    return basic_dic

# crwl movie_detail
def crwl_movie_detail(movie_id):
    detail_dic = {}
    html = requests_url_get_html(DETAIL_URL + movie_id)
    soup = bs(html, 'html.parser')
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

        #movie_actors = [actor.select_one('a').text for actor in movie_actor_div]
        detail_dic['movie_actor_list'] = movie_actors
        #감독
        movie_director_thumb = movie_detail.select_one('.obj_section > .director > .dir_obj > p > a > img')['src']
        movie_director = movie_detail.select_one('.obj_section > .director > .dir_obj > .dir_product > a').text
        detail_dic['movie_director'] = movie_director
        detail_dic['movie_director_thumb'] = movie_director_thumb
    except:
        detail_dic['movie_actor_list'] = []
        detail_dic['movie_director'] = ''
        detail_dic['movie_director_thumb'] = ''
        pass

    return detail_dic

# crwl video
def crwl_movie_video(movie_id):
    html = requests_url_get_html(VIDEO_URL+ movie_id)
    soup = bs(html, 'html.parser')

    video_thumb_list = soup.select('#content > div.article > div.obj_section2.noline > div > div.ifr_module > div > div > ul > li')

    video_list = []
    for video in video_thumb_list:
        video_list.append(video.select_one('a')['href'])

    return video_list

# crwl photo
def crwl_movie_photo(movie_id):
    html = requests_url_get_html(PHTOTO_URL+ movie_id)
    soup = bs(html, 'html.parser')

    photo_roll = soup.select('#photo_area > div > div.list_area._list_area > div > ul > li')

    photo_list = []
    for photo in photo_roll:
        photo_img = photo.select_one('a > img')['src']
        photo_list.append(photo_img)

    return photo_list

def crwl_movie_to_es(movie_data, es_info):

    es_client = ElasticSearchClient(host=es_info['host'], port=es_info['port'])
    es_client = es_client.getClient()
    es = ElasticSearchHelper(es_client)
    es_index = es_info['index']
    es_index_key = es_info['key']

    es_helper = ElasticSearchHelper(es_client)

    for movie_list in batch(movie_data):
        
        list_dict = []
        for movie_info in movie_list:
            movie_dic = {}
            movie = movie_info['movie']

            try:
                movie_id = crwl_movie_id(QUERY_URL + movie)
                movie_dic['movie_id'] = movie_id
            except:
                continue
            
            movie_basic = crwl_movie_basic(movie_id)
            

            if not movie_basic:
                continue #로그인이 필요한경우

            #한글
            movie_dic['h_movie'] = movie
            
            #영문
            movie_dic['h_movie2'] = movie_info['movie_en']
            #장르
            movie_dic['genre'] = movie_basic['genre']
            #영화 이미지
            movie_dic['movie_poster'] = movie_basic['movie_img']
            #국가
            movie_dic['nation'] = movie_basic['nation']
            #개봉일
            movie_dic['opening_date'] = movie_basic['opening_date']
            #상영시간
            movie_dic['show_time'] = movie_basic['show_time']
            #줄거리
            movie_dic['movie_story'] = movie_basic['movie_story']

            #score
            #movie_dic['actual_score'] = movie_basic['actual_score']
            #movie_dic['spc_score'] = movie_basic['spc_score']
            #movie_dic['ntz_score'] = movie_basic['ntz_score']
            movie_dic['score_avg'] = movie_basic['score_avg']

            #director => list
            movie_detail = crwl_movie_detail(movie_id)
    
            #배우/제작진
            movie_dic['movie_actor'] = movie_detail['movie_actor_list']
            movie_dic['movie_director'] = movie_detail['movie_director']

            #photo 
            movie_photo = crwl_movie_photo(movie_id)
            movie_dic['movie_photo'] = movie_photo
            #video
            movie_video = crwl_movie_video(movie_id)
            movie_dic['movie_video'] = movie_video

            list_dict.append(movie_dic)
        
        es_helper.indexBulk(es_index, list_dict, es_index_key)

  
if __name__ == "__main__":


    #get config
    config = get_config()

    #get data
    movie_data = get_movie_data()

    #crwl movie and esbulk
    es_info = dict(config.items('Elasticsearch'))
    crwl_movie_to_es(movie_data, es_info)
