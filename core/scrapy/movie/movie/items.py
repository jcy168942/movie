# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html

import scrapy

class MovieReviewItem(scrapy.Item):
    
    def __str__(self):
        return ""
    
    movie_id = scrapy.Field()
    review_score = scrapy.Field()
    review_id = scrapy.Field()
    review_txt = scrapy.Field()
    review_date = scrapy.Field()
    exception = scrapy.Field()

class MovieItem(scrapy.Item):
    # define the fields for your item here like:
    # name = scrapy.Field()
    crwl_type = scrapy.Field()
    movie_id = scrapy.Field()
    h_movie = scrapy.Field()
    h_movie2 = scrapy.Field()
    h_movie3 = scrapy.Field()
    genre = scrapy.Field()
    movie_actor = scrapy.Field()
    movie_director = scrapy.Field()
    movie_director_thumb = scrapy.Field()
    movie_video = scrapy.Field()
    movie_photo = scrapy.Field()
    movie_poster = scrapy.Field()
    movie_story = scrapy.Field()
    nation = scrapy.Field()
    opening_date = scrapy.Field()
    score_avg = scrapy.Field()
    show_time = scrapy.Field()
    exception = scrapy.Field()
    