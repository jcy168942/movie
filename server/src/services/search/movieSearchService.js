import es from '../../lib/elasticsearch.js';
import common from '../../static/commonStatic.js';
import esb from 'elastic-builder';
import { multiSearch } from '../../util/esUtil.js';

export default async function getMovie(queryParams, callback) {
    const res = await movieSearch(queryParams);

    //return Value
    let responseData = {};
    const total = res.body.hits.total.value;
    const hit = res.body.hits.hits[0];

    if (total === 0) {
        responseData['movie'] = [];
        responseData['graph'] = [];
        responseData['word_cloud'] = [];
        callback(false, responseData);
        return false;
    }

    responseData['movie'] = res.body.hits.hits[0]._source;

    //graph
    const movieMap = hit._source;
    const genreFlag = typeof movieMap['genre'] === 'undefined' ? false : true;
    const nationFlag = typeof movieMap['nation'] === 'undefined' ? false : true;
    const actorFlag =
        typeof movieMap['movie_actor']['name'] === 'undefined' ? false : true;
    const directorFlag =
        typeof movieMap['movie_director'] === 'undefined' ? false : true;

    const groupNodeList = [
        genreFlag
            ? { key: 'genre', field: 'genre', nested: false, type: 'Array' }
            : null,
        nationFlag
            ? { key: 'nation', field: 'nation', nested: false, type: 'Array' }
            : null,
        actorFlag
            ? {
                  key: 'actor',
                  field: 'movie_actor.name',
                  nested: true,
                  nested_field: 'movie_actor',
                  type: 'Array'
              }
            : null,
        directorFlag
            ? {
                  key: 'director',
                  field: 'movie_director',
                  nested: false,
                  type: 'String'
              }
            : null
    ];

    const graph = await getMovieGraph(movieMap, groupNodeList);
    const wordCloud = await movieWordCloud(queryParams);

    responseData['graph'] = graph;
    responseData['word_cloud'] = wordCloud;
    callback(false, responseData);
}

async function getMovieGraph(movieMap, groupNodeList) {
    const nodes = [];
    const links = [];
    const idCheckMap = new Map();
    const returnMap = {};

    //1depth
    nodes.push({
        id: 'movie',
        label: 'movie',
        type: 'organization'
    });

    for (const groupNode of groupNodeList) {
        //2depth
        if (!groupNode) {
            continue;
        }
        nodes.push({
            id: groupNode['key'],
            label: groupNode['key'],
            type: 'department'
        });
        links.push({
            source: groupNode['key'],
            target: 'movie',
            label: 'department'
        });
        links.push({
            source: 'movie',
            target: groupNode['key'],
            label: 'department'
        });
        const mapField =
            groupNode['nested'] === false
                ? groupNode['field']
                : groupNode['field'].split('.')[0];

        const groupList =
            groupNode['type'] === 'String'
                ? [movieMap[mapField]]
                : movieMap[mapField];

        let result = [];

        if (groupList.length > 0) {
            result = await findMovieByGroup(
                groupNode['key'],
                groupList,
                groupNode['field'],
                groupNode['nested'],
                groupNode['nested_field']
            );
        }

        for (const group of result) {
            //3depth
            nodes.push({ id: group['key'] });
            links.push({ source: group['key'], target: groupNode['key'] });
            for (const movie of group['movies']) {
                //4depth
                if (typeof idCheckMap.get(movie['movie_id']) === 'undefined') {
                    nodes.push({ id: movie['movie_id'] });
                }
                links.push({
                    source: movie['movie_id'],
                    target: group['key'],
                    label: movie['h_movie'],
                    svg: movie['movie_poster']
                });
            }
        }
    }

    returnMap['nodes'] = nodes;
    returnMap['links'] = links;

    return returnMap;
}

async function findMovieByGroup(
    groupName,
    groupList,
    field,
    nested,
    nestedField
) {
    const groupKeyList = [];
    for (const group of groupList) {
        if (groupName === 'actor') {
            if (group['part'] === '주연') {
                groupKeyList.push(group['name']);
            }
        } else {
            groupKeyList.push(group);
        }
    }

    return await groupListSearchByMultiSearch(
        groupKeyList,
        field,
        nested,
        nestedField
    );
}

async function groupListSearchByMultiSearch(
    groupList,
    field,
    nested,
    nestedField
) {
    const groupRequestBodyList = [];
    for (const group of groupList) {
        const requestBody = esb.requestBodySearch();
        const boolQuery = esb.boolQuery();
        let requestQuery = null;
        let bodyData = null;
        boolQuery.must([esb.matchQuery(field, group)]);
        if (nested) {
            requestQuery = new esb.nestedQuery(boolQuery, nestedField);
        } else {
            requestQuery = boolQuery;
        }
        bodyData = requestBody
            .query(requestQuery)
            .agg(
                esb
                    .termsAggregation(group, 'h_movie3')
                    .agg(
                        esb
                            .termsAggregation(group, 'movie_id')
                            .agg(esb.termsAggregation(group, 'movie_poster'))
                    )
            )
            .toJSON();
        groupRequestBodyList.push(bodyData);
    }

    return await multiSearch(groupRequestBodyList).then(function (
        msearchResponse
    ) {
        const groupMapList = [];
        const mResponses = msearchResponse.body.responses;
        for (const mResponse of mResponses) {
            const agg = mResponse.aggregations;
            const key = Object.keys(agg)[0];
            const buckets = agg[key].buckets;
            const moviesList = [];
            for (const bucket of buckets) {
                const movieMap = {};
                const h_movie = bucket.key;
                const movie_id = bucket[key].buckets[0].key;
                const poster = bucket[key].buckets[0][key].buckets[0];

                movieMap['movie_id'] = movie_id;
                movieMap['h_movie'] = h_movie;
                movieMap['movie_poster'] =
                    typeof poster !== 'undefined' ? poster.key : null;
                moviesList.push(movieMap);
            }
            const innerMap = {};
            innerMap['key'] = key;
            innerMap['movies'] = moviesList;
            innerMap['value'] = moviesList.length;
            groupMapList.push(innerMap);
        }
        return groupMapList;
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

async function movieWordCloud(queryParams) {
    let query = queryParams.movie_id;
    const requestBody = new esb.requestBodySearch();
    const bodyData = requestBody
        .source('word_cloud')
        .query(esb.matchQuery('movie_id', query))
        .size(1)
        .toJSON();

    const response = await es.search({
        index: common.ES_WORDCLOUD_INDEX,
        body: bodyData
    });

    const total = response.body.hits.total.value;
    if (total === 0) {
        return [];
    }

    const wordCloud = response.body.hits.hits[0]._source.word_cloud;
    const wordMapList = [];

    let valueFlag = false;

    if (wordCloud.length < 800) {
        valueFlag = true;
    }
    for (const word of wordCloud) {
        const wordMap = {};
        const wordData = word.split('__');
        wordMap['word'] = wordData[0];
        wordMap['value'] = !valueFlag
            ? wordData[1]
            : String(parseInt(wordData[1]) + 50);
        wordMapList.push(wordMap);
    }

    return wordMapList;
}
