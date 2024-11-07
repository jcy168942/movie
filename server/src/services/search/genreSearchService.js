import es from '../../lib/elasticsearch.js';
import common from '../../static/commonStatic.js';
import esb from 'elastic-builder';

export default async function getGenreList(callback) {
    //today
    let today = new Date();
    const year = today.getFullYear().toString();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const recentMonth = ('0' + (today.getMonth() - 5)).slice(-2);
    const date = ('0' + today.getDate()).slice(-2);

    today = year + '.' + month.toString() + '.' + date;
    const recentDay = year + '.' + recentMonth + '.' + date;

    const genreResponse = await genreSearch();
    const allGenre = [];
    const agg = genreResponse.body.aggregations;
    for (const bucket of agg['genre'].buckets) {
        allGenre.push(bucket['key']);
    }

    const genreMovieList = [];
    for (const genre of allGenre) {
        const genreMap = {};
        const requestBody = esb.requestBodySearch();
        const boolQuery = esb.boolQuery();
        boolQuery
            .must(esb.matchQuery('genre', genre))
            .must(esb.rangeQuery('opening_date').gte(recentDay).lte(today));
        const bodyData = requestBody
            .query(boolQuery)
            .sort(esb.sort('opening_date', 'desc'))
            .toJSON();
        bodyData['_source'] = [
            'movie_id',
            'h_movie',
            'movie_poster',
            'genre',
            'opening_date'
        ];
        const response = await es.search({
            index: common.ES_MOVIE_INDEX,
            body: bodyData
        });

        const hits = response.body.hits.hits;
        const moviesList = [];
        for (const hit of hits) {
            const movieMap = hit._source;
            moviesList.push(movieMap);
        }

        genreMap['genre'] = genre;
        genreMap['movies'] = moviesList;
        genreMovieList.push(genreMap);
    }

    callback(false, genreMovieList);
}

async function genreSearch() {
    const requestBody = new esb.requestBodySearch();
    const bodyData = requestBody
        .agg(esb.termsAggregation('genre', 'genre'))
        .toJSON();

    const response = await es.search({
        index: common.ES_MOVIE_INDEX,
        body: bodyData
    });

    return response;
}
