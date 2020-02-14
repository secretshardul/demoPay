'use strict';
const axios = require('axios');
module.exports.main = async event => {
    console.log(event);
    try{
        let response = await axios.post('https://api.textlocal.in/send/', null,{
            params: {//passed as query string params
                'message': event['message'],
                'apiKey': process.env.TEXTLOCAL_API_KEY,
                'numbers': event['number'],
                // 'test': true //set as 'true' for testing
            }
        });
        let data = response.data;//includes failure message returned by Textlocal
        if(data['status'] === 'success'){
            console.log('success', data);
        }
        else {
            console.log('failure', data);
        }
        return data;
    }
    catch (error) {//error when sending request
        console.log('error sending message',error);
        return error;
    }
};
