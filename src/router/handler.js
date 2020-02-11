'use strict';
const AWS = require('aws-sdk');
const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({apiVersion: '2016-04-18'});
const lambda = new AWS.Lambda();
module.exports.main = async event => {
    /**
     * 1. User pool management: check if number exists in cognito (adminGetUser)
     * 2. Routing: route to other lambda depending on 1st word
     */
    //Serverless framework parses x-www-form-urlencoded on own in Lambda integration
    //key will always be present, value may be absent

    console.log(event); //log event
    let body = event['body'];
    let sender = body['sender']; //international format but no plus
    let message = body['comments'];
    let messageArray = message.split(/(\s+)/); //create array based on spaces
    let route = messageArray[0].toUpperCase();  //case insensitive

    //check if 'sender' number exists in Cognito user pool
    const params = {
        UserPoolId: process.env.USER_POOL_ID,
        Username: sender
    };
    try{
        const credentials = await cognitoidentityserviceprovider.adminGetUser(params).promise();
    }

    //when user is unregistered
    catch(error) {
        /**
         * Route #1 (/register): Unregistered user is registering
         * Call lambda which registers user
         */
        if(route === 'REGISTER'){
            //TODO: call register Lambda
            //TODO: register(number)
            pushLogs(sender,message,'/register');
        }
        else{
            /**
             * Route #2(/registerMessage): Unregistered user sends random message
             * Ask user to register
             */
            pushLogs(sender,message,'/registerMessage');
            const params =
                    {
                        FunctionName: process.env.SEND_MESSAGE_FUNCTION,
                        InvocationType: 'Event', //Event for asynchronous, RequestResponse for synchronous
                        Payload: JSON.stringify({
                            "message": "Please register with demoPay by entering REGISTER",
                            "number": sender
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
    }
    //when user is registered

    if(route === 'BROWSE'){
        /**
         * Route #3 (/browse): Registered user wants to browse catalog
         * Display message containing service catalog
         */
        //TODO: call message Lambda for browsing catalog
        //TODO: browse(number, messageArray)
        pushLogs(sender,message,'/browse');
    }
    else if(route === 'PAY'){
        /**
         * Route #4 (/pay): Registered user wants to make payment
         */
        //TODO: call payment Lambda function
        //TODO: pay(number, messageArray)
        pushLogs(sender,message,'/pay');
    }
    else if(route === 'PASSBOOK'){
        /**
         * Route #5 (/passbook): Registered user wants view payment history
         */
        //TODO: call passbook Lambda function
        //TODO: passbook(number)
        pushLogs(sender,message,'/passbook');
    }
    else{
        /**
         * Route #6 (/home): Display home screen to user
         * Input can be blank or random text
         */
        //TODO: call home Lambda function
        //TODO: home(number)
        pushLogs(sender,message,'/home');
    }
};

/**
 * Log to Cloudwatch for analytics, return and exit
 * @param sender
 * @param message
 * @param route
 */
function pushLogs(sender, message, route) {
    const logMessage = {
        'sender': sender,
        'message': message,
        'route': route
    };
    console.log(logMessage);
    return logMessage;
}
