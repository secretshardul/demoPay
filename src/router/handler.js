'use strict';
// let trial = require('./trial');
module.exports.main = async event => {
    console.log(event);
    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                message: 'Handler one',
                input: event,
            },
            null,
            2
        ),
    };

    // Use this code if you don't use the http event with the LAMBDA-PROXY integration
    // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
