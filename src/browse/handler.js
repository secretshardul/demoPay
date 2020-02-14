'use strict';
const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();
const dynamodb = new AWS.DynamoDB();
/**
 * @param event['number']
 * /browse Lambda
 * - Query items from 'catalogActive' database
 */
module.exports.main = async event => {
    //TODO: store and retrieve catalog message from cache
    if(!('number' in event))
    {
        console.log('no number present, browse failed', event);
        return event;
    }
    let catalog = 'Catalog';
    let currentCategory = '';
    let itemCounter;
    const dbParams = {
        // TableName: 'main-dev-catalogActive-IVQNKAZIRSRR' //for local
        TableName: process.env.CATALOGACTIVE_TABLE_NAME
    };
    try{
        const catalogActive = await dynamodb.scan(dbParams).promise();
        console.log('scan successful', catalogActive['Items']);

        catalogActive['Items'].forEach((item, index) => {
            const plan = item['plan']['S'];
            const company = item['company']['S'];
            const serviceCode = item['serviceCode']['S'];
            const userCode = item['userCode']['S'];
            let amount;
            if ('amount' in item){
                amount = item['amount']['N']; //number
            }
            else{
                amount = '*amount*'; //string
            }
            if(item['category']['S'] !== currentCategory){
                currentCategory = item['category']['S'];
                catalog += '\n\n----'+currentCategory + '----';
                itemCounter = 0;
            }
            itemCounter += 1;
            catalog += `\n${itemCounter}. ${company} ${plan}: PAY ${serviceCode} *${userCode}* ${amount}`;
            /**Example
             * Catalog
             TV
             Dish TV cartoon pack: PAY TVDTCP *bill number* 500
             Tata Sky value pack: PAY TVTSVP *bill number* 100
             power
             Reliance bill payment: PAY PORLBP *bill number* *amount*
             Tata bill payment: PAY POTABP *bill number* *amount*
             phone
             Jio 4G unlimited: PAY PHJI4L *phone number* 400
             Vodafone 4G 1GB: PAY PHVO41 *phone number* 200
             */
        });
        console.log("success fetching catalog", catalog);

        const params =
            {
                FunctionName: process.env.SEND_MESSAGE_FUNCTION,
                InvocationType: 'Event', //Event for asynchronous, RequestResponse for synchronous
                Payload: JSON.stringify({
                    message: catalog,
                    number: event['number']
                })
            };
        try{
            let data = await lambda.invoke(params).promise();
            console.log('invoked send SMS Lambda with /registerMessage', params);
        }
        catch(error) {
            console.log('failure invoking lambda', error);
            return error;
        }
        return {
            'catalog': catalog
        };
    }
    catch (error) {
        console.log('scan failed', error);
        return error;
    }
};
