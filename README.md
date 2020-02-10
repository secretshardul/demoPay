# Brief working
![](images/2020-02-07-14-36-34.png)
User registers with demoPay and initiates payment using SMS. demoPay then makes a **UPI collect/pull request** to the user. The user then makes payment using ***99#**. demoPay then forwards the payment to the end utility provider.

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

#User authentication
Use **admin flow** for backend.
1. adminGetUser: in router
2. adminCreateUser: in register

#URL encoding issue
Non-enlish characters get encoded which increases size. Eg. ```क्या हाल है``` saved as ```%E0%A4%95%E0%A5%8D%E0%A4%AF%E0%A4%BE%20%E0%A4%B9%E0%A4%BE%E0%A4%B2%20%E0%A4%B9%E0%A5%88```