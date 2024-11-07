import es from '../../lib/elasticsearch.js';
import common from '../../static/commonStatic.js';
import esb from 'elastic-builder';

export default async function getMoiveGroup(queryParams, callback) {
    groupSearch(queryParams).then(function (res) {
        callback(false, res);
    });
}

async function groupSearch(queryParams) {
    let group = queryParams.group;
    let name = queryParams.name;
    let movie_id = queryParams.movie_id;

    const responseData = {};

    //query
    const requestBody = new esb.requestBodySearch();
    const boolQuery = new esb.boolQuery();
    let bodyData = null;

    if (group === '감독') {
        boolQuery.must([esb.matchQuery('movie_director', name)]);
        bodyData = requestBody
            .query(boolQuery)
            .agg(
                esb
                    .filterAggregation(
                        'genre_filter',
                        esb
                            .boolQuery()
                            .mustNot(esb.matchQuery('movie_id', movie_id))
                    )
                    .agg(esb.termsAggregation('genre', 'genre'))
            )
            .toJSON();
    } else {
        boolQuery.must([esb.matchQuery('movie_actor.name', name)]);
        const nestedQuery = new esb.nestedQuery(boolQuery, 'movie_actor');
        bodyData = requestBody
            .query(nestedQuery)
            .agg(
                esb
                    .filterAggregation(
                        'genre_filter',
                        esb
                            .boolQuery()
                            .mustNot(esb.matchQuery('movie_id', movie_id))
                    )
                    .agg(esb.termsAggregation('genre', 'genre'))
            )
            .toJSON();
    }

    const response = await es.search({
        index: common.ES_MOVIE_INDEX,
        body: bodyData
    });

    const movieList = [];

    for (const hit of response.body.hits.hits) {
        const hitMap = {};
        hitMap['movie_id'] = hit._source.movie_id;
        hitMap['movie_poster'] = hit._source.movie_poster;
        hitMap['h_movie'] = hit._source.h_movie;
        movieList.push(hitMap);
    }

    responseData['group'] = group;
    responseData['movie'] = movieList;

    //response agg
    const aggregation = response.body.aggregations;

    responseData['genre'] = aggregation.genre_filter.genre.buckets;

    return responseData;
}
