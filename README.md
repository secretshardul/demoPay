# Brief working 
Source code for a proposed bill payments system for low end mobiles without internet. It builds upon the [Indian Unified Payments Interface(UPI)](https://en.wikipedia.org/wiki/Unified_Payments_Interface), a payment network comparable to Mastercard. It has two modes of operation:
1. **Online**: Its web API is used by payment apps like Google Pay. 
2. **Offline**: Uses [Unstructured Supplementary Service Data(USSD)](https://en.wikipedia.org/wiki/Unstructured_Supplementary_Service_Data) technology. USSD is the two way protocol behind **short codes** used to check cell phone balance. UPI's short code `*99#` can be used to check bank balance and make payments. This facility can be used by any GSM phone with basic cellular connectivity.

Online UPI payments have raced ahead due to value added services like bill payments provided by smartphone apps. DemoPay aims to bring bill payments to non-internet phones. It uses USSD as the payments channel and SMS as the communication channel.

![](images/2020-02-07-14-36-34.png)

![image](https://user-images.githubusercontent.com/49580849/84625602-39563300-af01-11ea-9271-9b97e0e46fc9.png)

This project was pitched in [CIIE Grand Challenge](https://grand-challenge.ciie.co/). Do check out the [pitch deck](https://docs.google.com/presentation/d/1w9cUfRYwfxIA_XNaGBUbHKQaMWeYx-kSoxCZGX06RTA/edit?usp=sharing).

# Tech stack and working
1. **Two way SMS using Textlocal**: Textlocal provides a programmable API to send SMS. It also reads the SMS sent back by user and passes it to the backend though a webhook.
2. The app uses a serverless backend running on AWS cloud. It is built with the **Serverless framework**.
  1. **API gateway**: Acts as a webhook. It reads SMS data sent by Textlocal.
  2. **Lambda**: Responsible for routing and calling the UPI APIs. It checks if the end user has enough funds and makes a `collect money` request.
  3. **Cognito**: For user pool management. Since this app is SMS based and not REST API based, a server side approach was needed to manage users. This was done using cognito admin SDK.
  
    ```js
    await cognitoidentityserviceprovider.adminCreateUser(params)
    ```
  4. **DynamoDB**: Used to store user and service provider data.

# Navigation structure
Webhook calls an API gateway endpoint which in turn triggers a lambda. This lambda performs routing using an if-else structure and calls other lambdas.

| Input                             | description                                                                                                                                                                                 |
|-----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| ```*```(unregistered user)        | Display registration structure                                                                                                                                                              |
| ```REGISTER```                    | Register account                                                                                                                                                                            |
| ```*```(registered user)          | Display message structure for how to browse, view passbook, making payment etc. This is the default route if invalid input is entered(but user is registered)                               |
| ```BROWSE```                      | To browse catalog of different services. It has subdirectories for navigation, eg to view power services enter "BROWSE POWER". Browsing helps user find **SERVICE_CODE** needed for payment |
| ```PAY <SERVICE_CODE> <AMOUNT>``` | make payment based on service code. PAY <SERVICE_CODE> <AMOUNT>                                                                                                                             |
| ```PASSBOOK```                    | view passbook(payment history)                                                                                                                                                              |

The routing keyword is **case insensitive**.

# SMS mechanism
## Receive SMS
![](https://www.lucidchart.com/publicSegments/view/e0595a0b-ae20-4024-9f02-22b986662ae9/image.png)

Textlocal webhook makes POST request containing URL encoded string

| parameter | description                                               | use                                                                     |
|-----------|-----------------------------------------------------------|-------------------------------------------------------------------------|
| sender    | The sender's mobile phone number in international format. | Yes                                                                     |
| keyword   | keyword of the inbox.                                     | No. Routing performed in Lambda                                         |
| content   | The full message content.                                 | Yes                                                                     |
| comments  | If applicable, the message without the inbox keyword.     | NO                                                                      |
| inNumber  | Inbound number                                            | No                                                                      |
| email     | Any email address extracted from the message.             | Free service provided by TextLocal. Email registration can be a feature |
| credits   | Credits remaining in account                              | No                                                                      |


```
sender=919619477301&content=CQAMH%20this%20is%20body%20trial%40gmail.com&inNumber=919220592205&submit=Submit&network=&email=trial@gmail.com&keyword=CQAMH&comments=this%20is%20body%20trial%40gmail.com&credits=7&msgId=6480777653&rcvd=2020-02-08%2019%3A59%3A52&firstname=&lastname=&custom1=&custom2=&custom3=

sender=919619477301&
content=CQAMH this is body trial@gmail.com
inNumber=919220592205
submit=Submit
network=
email=trial@gmail.com
keyword=CQAMH
comments=this is body trial@gmail.com
credits=7
msgId=6480777653
rcvd=2020-02-08 19:59:52
firstname=
lastname=
custom1=
custom2=
custom3=
```

### Endpoint security
Textlocal provides basic access authentication with SSL. It can send username and password through  ```Authorization``` header in following format:
```
Authorization: Basic <credentials>
Authorization: Basic bXl1c2VyOm15cGFzc3dvcmQ=
```
<credentials> is a base64 string of format
```
myuser:mypassword
```
### Message extraction:
1. Use 'comments': for shared number
2. Use 'content' in case dedicated number is purchased.
## Send SMS
![](https://www.lucidchart.com/publicSegments/view/07ac2265-3dfa-443b-9385-9e5f62c70d33/image.png)

API takes input in **application/x-www-form-urlencoded** format.

![](images/send_SMS_postman.png)



```sh
curl -X POST \
  http://api.textlocal.in/send/ \
  -d 'apiKey=<your_API_key>&message=sent%20by%20me%20from%20textlocal%20API&numbers=<phone_numbers_separated_by_commas>&test=true'
```

### API responses
All responses have 200 status code. Error is identified with "code" parameter.
```
{
    "errors": [
        {
            "code": 3,
            "message": "Invalid login details"
        }
    ],
    "status": "failure"
}
```

# UML diagrams
## System architecture
![](https://www.lucidchart.com/publicSegments/view/c319d3a5-bfa4-4292-8e0d-5bff5af5c075/image.png)

# Design considerations
1. Routing using textlocal or Lambda? Routing can also be done by textlocal by using inbox keywords.
- Textlocal 
    - advantages: No routing logic needed in code
    - disadvantages:
        - Can't be programatically assigned.
        - Vendor lock in.
- Lambda: Can find if route exists from database
Conclusion: Use Lambda for routing
2. Use separate database table for each catalog category?
    - In current scheme of common table sort key is 'plan'. So two plans by different service providers can't have same names.
    - But tables are currently small
Solution: use serviceCode as sort key because it is unique

# User authentication
Use **admin flow** for backend.
1. adminGetUser: in router
2. adminCreateUser: in register

# URL encoding issue
Non-english characters get encoded which increases size. Eg. ```क्या हाल है``` saved as ```%E0%A4%95%E0%A5%8D%E0%A4%AF%E0%A4%BE%20%E0%A4%B9%E0%A4%BE%E0%A4%B2%20%E0%A4%B9%E0%A5%88```

# NPCI APIs to use
1. ReqValAddress
2. ReqListAccount
3. Pay

# ICICI bank APIs
1. Add account > list accounts
This API is used to returns customer accounts for given account provider registered with provided mobile number.
```
{
  "seqNumber": "ef1e92b4a01d4618a0eca5fdecc37ff23f3",
  "MobileNumber": "902890XXXX",
  "deviceId": "8452165486XXXX",
  "channelcode": "ImoXXXX",
  "AccountProvider": "1"
}
```

# Database design
1. catalogActive: category(hash key), company, plan, serviceCode(sort key), userCode(bill number, phone number etc), amount
2. catalogInactive: category(hash key), company, plan, serviceCode(sort key), userCode(bill number, phone number etc), amount
3. userTransactions: user(hash key), transactionId(sort key), serviceCode, amount, status(success/fail/refund)
