import es from '../../lib/elasticsearch.js';
import common from '../../static/commonStatic.js';
import esb from 'elastic-builder';

export default async function crwlMovie(queryParams, callback) {
    movieSearch(queryParams).then(function (res) {
        //return Value
        const responseData = {};
        const total = res.body.hits.total.value;
        if (total > 0) {
            responseData['status'] = 'Sucess';
        } else {
            crwlIndexing(queryParams.movie_id);
            responseData['status'] = 'Crwling....';
        }
        callback(false, responseData);
    });
}

async function movieSearch(queryParams) {
    let query = queryParams.movie_id;
    const requestBody = new esb.requestBodySearch();
    const bodyData = requestBody
        .query(esb.matchQuery('movie_id', query))
        .size(1)
        .toJSON();
    const response = await es.search({
        index: common.ES_MOVIE_INDEX,
        body: bodyData
    });
    return response;
}
async function crwlIndexing(movie_id) {
    await es.index({
        index: common.ES_CRWL_INDEX,
        id: movie_id,
        body: { movie_id: movie_id }
    });
}
