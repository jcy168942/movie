import es from '../../lib/elasticsearch.js';
import common from '../../static/commonStatic.js';
import esb from 'elastic-builder';
import { esScrollData, esDataPaging } from '../../util/esUtil.js';

export default async function getMoiveReview(queryParams, callback) {
    //Query
    const response = await movieReviewSearch(queryParams);

    callback(false, response);
}

async function movieReviewSearch(queryParams) {
    //return Value
    let responseData = {};
    let sentimentFlag = queryParams.sentimentFlag;
    sentimentFlag =
        typeof sentimentFlag !== 'undefined'
            ? sentimentFlag === 'true' || sentimentFlag === 'True'
                ? (sentimentFlag = true)
                : (sentimentFlag = false)
            : false;

    if (sentimentFlag) {
        const positiveRequestBody = new esb.requestBodySearch();
        const positiveBoolQuery = esb
            .boolQuery()
            .must(esb.matchQuery('movie_id', queryParams.movie_id))
            .must(esb.matchQuery('review_positive', true));
        const positiveBodyData = positiveRequestBody
            .query(positiveBoolQuery)
            .sort(esb.sort('review_sentiment_score', 'desc'))
            .size(10)
            .toJSON();

        const positiveResponse = await es.search({
            index: sentimentFlag
                ? common.ES_REVIEW_SENTIMENT_INDEX
                : common.ES_REVIEW_INDEX,
            body: positiveBodyData
        });

        const positiveHits = positiveResponse.body.hits.hits;
        const positiveList = [];
        for (const hit of positiveHits) {
            positiveList.push(hit._source);
        }

        const negativeRequestBody = new esb.requestBodySearch();
        const negativeBoolQuery = esb
            .boolQuery()
            .must(esb.matchQuery('movie_id', queryParams.movie_id))
            .must(esb.matchQuery('review_positive', false));
        const negativeBodyData = negativeRequestBody
            .query(negativeBoolQuery)
            .sort(esb.sort('review_sentiment_score', 'desc'))
            .size(10)
            .toJSON();

        const negativeResponse = await es.search({
            index: sentimentFlag
                ? common.ES_REVIEW_SENTIMENT_INDEX
                : common.ES_REVIEW_INDEX,
            body: negativeBodyData
        });

        const negativeHits = negativeResponse.body.hits.hits;
        const negativeList = [];
        for (const hit of negativeHits) {
            negativeList.push(hit._source);
        }

        const reviewMap = {};
        const sentimentMap = {};
        sentimentMap['positive'] = positiveList;
        sentimentMap['negative'] = negativeList;
        reviewMap['data'] = sentimentMap;
        reviewMap['sentiment'] = true;
        responseData['review'] = reviewMap;
    } else {
        const requestBody = new esb.requestBodySearch();
        const bodyData = requestBody
            .query(esb.matchQuery('movie_id', queryParams.movie_id))
            .size(10)
            .toJSON();

        const response = await es.search({
            index: sentimentFlag
                ? common.ES_REVIEW_SENTIMENT_INDEX
                : common.ES_REVIEW_INDEX,
            body: bodyData,
            scroll: '30s'
        });
        //scroll
        const scroll_data = await esScrollData(response);
        //paging
        const sourceList = esDataPaging(queryParams, scroll_data);
        const reviewMap = {};
        reviewMap['data'] = sourceList;
        reviewMap['sentiment'] = false;
        responseData['review'] = reviewMap;
    }

    return responseData;
}
