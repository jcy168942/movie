import es from '../../lib/elasticsearch.js';
import common from '../../static/commonStatic.js';
import esb from 'elastic-builder';
import { esScrollData, esDataPaging } from '../../util/esUtil.js';

export default async function getMovies(queryParams, callback) {
    //상단 movie data(개봉,평점,장르)
    getTopMovies(queryParams.query).then(function (topMovie) {
        //return Value
        const responseData = topMovie;
        //Query
        const requestBody = new esb.requestBodySearch();
        const boolQuery = new esb.boolQuery();

        //genrefilter
        genreFilterBoolQuery(queryParams, boolQuery);
        //nation
        nationFilterBoolQuery(queryParams, boolQuery);
        //range showtime
        showtimeRangeFilterBoolQuery(queryParams, boolQuery);
        //range opendate
        openDateRangeFilter(queryParams, boolQuery);
        //movie_query_filter적용
        mainMovieSearch(queryParams, requestBody, boolQuery).then(function (
            res
        ) {
            const showTimeRangeFrom = res.body.aggregations['show_time']['min'];
            const showTimeRangeTo = res.body.aggregations['show_time']['max'];

            const showTimeRange = {};
            showTimeRange['from'] = showTimeRangeAdjustment(
                showTimeRangeFrom,
                false
            );
            showTimeRange['to'] = showTimeRangeAdjustment(
                showTimeRangeTo,
                true
            );
            responseData['show_time_range'] = showTimeRange;

            //scroll
            esScrollData(res).then(function (data) {
                //paging
                const sourceList = esDataPaging(queryParams, data);
                responseData['movies'] = sourceList;
                callback(false, responseData);
            });
        });
    });
}

async function getTopMovies(query) {
    const topResultData = {};

    //today
    let today = new Date();
    const year = today.getFullYear().toString();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const recentMonth = ('0' + today.getMonth()).slice(-2);
    const date = ('0' + today.getDate()).slice(-2);

    today = year + '.' + month.toString() + '.' + date;
    const recentDay = year + '.' + recentMonth + '.' + date;

    //poster script query
    const scriptQuery = esb.scriptQuery(
        esb
            .script()
            .lang('painless')
            .inline(
                'int poster = doc["movie_poster"].value.length();return poster > 0;'
            )
    );

    //상단 영화 고정
    const topBoolQuery = new esb.boolQuery();
    topBoolQuery
        .must([esb.matchAllQuery(), esb.existsQuery('movie_poster')])
        .filter(scriptQuery);

    //평점순
    const requestTopScoreBody = new esb.requestBodySearch();
    const topScoreData = requestTopScoreBody
        .query(topBoolQuery)
        .sort(esb.sort('score_avg', 'desc'))
        .size(10)
        .toJSON();

    const topScoreResponse = await es.search({
        index: common.ES_MOVIE_INDEX,
        body: topScoreData
    });

    const topScoreMovies = [];
    for (const hit of topScoreResponse.body.hits.hits) {
        const sourceData = {};
        sourceData['movie_id'] = hit._source.movie_id;
        sourceData['h_movie'] = hit._source.h_movie;
        sourceData['movie_poster'] = hit._source.movie_poster;
        sourceData['score_avg'] = hit._source.score_avg;
        topScoreMovies.push(sourceData);
    }

    topResultData['top_score_movie'] = topScoreMovies;

    //개봉순
    const requestTopOpenBody = new esb.requestBodySearch();
    const openBoolQuery = esb.boolQuery();
    openBoolQuery
        .must(esb.rangeQuery('opening_date').gte(recentDay).lte(today))
        .must(topBoolQuery);
    const topOpenData = requestTopOpenBody
        .query(openBoolQuery)
        .sort(esb.sort('opening_date', 'desc'))
        .size(10)
        .toJSON();

    const topOpenResponse = await es.search({
        index: common.ES_MOVIE_INDEX,
        body: topOpenData
    });

    const topOpenMovies = [];
    for (const hit of topOpenResponse.body.hits.hits) {
        const sourceData = {};
        sourceData['movie_id'] = hit._source.movie_id;
        sourceData['h_movie'] = hit._source.h_movie;
        sourceData['movie_poster'] = hit._source.movie_poster;
        sourceData['opening_date'] = hit._source.opening_date;
        topOpenMovies.push(sourceData);
    }

    topResultData['top_open_movie'] = topOpenMovies;

    //개봉예정
    const requestTopToBeOpenBody = new esb.requestBodySearch();
    const toBeopenBoolQuery = esb.boolQuery();
    toBeopenBoolQuery
        .must(esb.rangeQuery('opening_date').gt(today))
        .must(topBoolQuery);
    const topToBeOpenData = requestTopToBeOpenBody
        .query(toBeopenBoolQuery)
        .sort(esb.sort('opening_date', 'desc'))
        .size(10)
        .toJSON();

    const topToBeOpenResponse = await es.search({
        index: common.ES_MOVIE_INDEX,
        body: topToBeOpenData
    });

    const topToBeOpenMovies = [];
    for (const hit of topToBeOpenResponse.body.hits.hits) {
        const sourceData = {};
        sourceData['movie_id'] = hit._source.movie_id;
        sourceData['h_movie'] = hit._source.h_movie;
        sourceData['movie_poster'] = hit._source.movie_poster;
        sourceData['opening_date'] = hit._source.opening_date;
        topToBeOpenMovies.push(sourceData);
    }

    topResultData['top_to_be_open_movie'] = topToBeOpenMovies;

    //genre 태그 고정
    const requestSubBody = new esb.requestBodySearch();
    const subData = requestSubBody
        .query(esb.matchQuery('h_movie', query))
        .agg(esb.termsAggregation('genre', 'genre'))
        .size(0)
        .toJSON();

    const subResponse = await es.search({
        index: common.ES_MOVIE_INDEX,
        body: subData
    });

    //aggregation
    const aggGenre = subResponse.body.aggregations.genre.buckets;
    topResultData['genre'] = aggGenre;

    return topResultData;
}
function genreFilterBoolQuery(queryParams, boolQuery) {
    //genrefilter
    const genreFilter = queryParams.genreFilter;
    if (
        typeof genreFilter !== 'undefined' &&
        genreFilter !== 'null' &&
        genreFilter.trim() !== ''
    ) {
        const genreBoolQuery = new esb.boolQuery();
        const genreFilterList = genreFilter.split(',');
        for (const genre of genreFilterList) {
            genreBoolQuery.should(esb.matchQuery('genre', genre));
        }
        boolQuery.must(genreBoolQuery);
    }
}
function nationFilterBoolQuery(queryParams, boolQuery) {
    //nationFilter
    const nationFlag = queryParams.nationFlag;
    if (
        typeof nationFlag !== 'undefined' &&
        nationFlag !== (null || '') &&
        nationFlag.trim() !== ''
    ) {
        if (nationFlag === 'True') {
            boolQuery.must(esb.matchQuery('nation', '한국'));
        } else if (nationFlag === 'False') {
            boolQuery.mustNot(esb.matchQuery('nation', '한국'));
        }
    }
}
function showtimeRangeFilterBoolQuery(queryParams, boolQuery) {
    const showTimeFilter = queryParams.showTimeFilter;
    if (
        typeof showTimeFilter !== 'undefined' &&
        showTimeFilter !== ('null' || '') &&
        showTimeFilter.trim() !== ''
    ) {
        const showTimeRange = showTimeFilter.split(',');
        const showTimeFrom = showTimeRange[0];
        const showTimeTo = showTimeRange[1];

        boolQuery.must(
            esb.rangeQuery('show_time').gte(showTimeFrom).lte(showTimeTo)
        );
    }
}
function openDateRangeFilter(queryParams, boolQuery) {
    const openDateFilter = queryParams.openDateFilter;
    if (
        typeof openDateFilter !== 'undefined' &&
        openDateFilter !== (null || '') &&
        openDateFilter.trim() !== ''
    ) {
        const openDateRange = openDateFilter.split(',');
        const openDateFrom = openDateRange[0];
        const openDateTo = openDateRange[1];

        boolQuery.must(
            esb.rangeQuery('opening_date').gte(openDateFrom).lte(openDateTo)
        );
    }
}

async function mainMovieSearch(queryParams, requestBody, boolQuery) {
    const query = queryParams.query;
    const sort =
        typeof queryParams.sort !== 'undefined'
            ? queryParams.sort
            : 'score_avg';

    const sortScript = esb
        .sort()
        .type('number')
        .script(
            esb
                .script()
                .lang('painless')
                .inline(
                    'if(doc["h_movie3"].size() != 0){if(params.movie_name == doc["h_movie3"].value) { return 0;}} return 100000;'
                )
                .params({ movie_name: query })
        )
        .order('asc');

    boolQuery.must(esb.matchPhraseQuery('h_movie', query));
    const bodyData = requestBody
        .query(boolQuery)
        .agg(esb.termsAggregation('genre', 'genre'))
        .agg(esb.statsAggregation('show_time', 'show_time'))
        .size(10000)
        .sort(sortScript)
        .sort(esb.sort(sort, 'desc'))
        .toJSON();

    const response = await es.search({
        index: common.ES_MOVIE_INDEX,
        body: bodyData,
        scroll: '30s'
    });

    return response;
}

function roundToNextNumber(number, n) {
    const abs = n < 0 ? Math.abs(n) : n;
    let num = 0;
    for (let i = 0; i < abs; i++) {
        if (number * i < abs && abs <= number * (i + 1)) {
            num = i + 1;
        }
    }
    return n % number === 0 ? n : n < 0 ? -number * (num - 1) : number * num;
}

function showTimeRangeAdjustment(showTime, flag) {
    return flag
        ? roundToNextNumber(30, showTime)
        : roundToNextNumber(30, showTime) - 30;
}
