'use strict';
const AWS = require('aws-sdk');
const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({apiVersion: '2016-04-18'});
const lambda = new AWS.Lambda();
/**
 *
 * @param event['number']
 * /register Lambda
 * - Check if number is UPI enabled using NPCI's 'ReqListAccount' API. 'P01' error returned if not present.
 * - If yes save user's phone number in cognito
 * - Call sendMessage() to send message about successful or unsuccessful registration.
 */
module.exports.main = async event => {
    const number = event['number'];
    //TODO:check if number is UPI enabled
    //company has its own UPI number
    const params = {
        UserPoolId: process.env.USER_POOL_ID,
        Username: number,
        MessageAction: 'SUPPRESS', //no need of OTP, registration done via SMS
        UserAttributes: [
            {
                Name: 'phone_number',
                Value: '+'+number //stored as '+<country_code><number>
            },
            {
                Name: 'phone_number_verified',
                Value: 'true'
            }
        ],
    };
    try{
        let data = await cognitoidentityserviceprovider.adminCreateUser(params).promise();
        console.log('registration success', data);
        return await invokeSendMessageFunction('You have registered successfully for demoPay', number);
    }catch (error) {
        console.log('registration failure', error);
        return await invokeSendMessageFunction('Registration failed for demoPay', number);
    }
};

//TODO: add invokeSendMessageFunction to layer
//Commonly used functions which can be shared
/**
 *
 * @param message
 * @param number
 * @returns {Promise<(Lambda.InvocationResponse & {$response: Response<Lambda.InvocationResponse, AWSError>})|*>}
 */
async function invokeSendMessageFunction(message, number) {
    const params =
        {
            FunctionName: process.env.SEND_MESSAGE_FUNCTION,
            InvocationType: 'Event', //Event for asynchronous, RequestResponse for synchronous
            Payload: JSON.stringify({
                "message": message,
                "number": number
            })
        };
    try{
        let data = await lambda.invoke(params).promise();
        console.log("invoked send SMS Lambda", params);
        return data;
    }
    catch(error) {
        console.log("failure invoking lambda", error);
        return error;
    }
}
