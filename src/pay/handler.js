'use strict';
const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();
const dynamodb = new AWS.DynamoDB();
/**
 * @param event['messageArray']
 * @returns {Promise<void>}
 *
 * Working
 * - Check if serviceCode and amount is valid by querying 'tableActive'
 * - Initiate UPI 'COLLECT' request by calling 'ReqPay'
 */
module.exports.main = async event => {

};