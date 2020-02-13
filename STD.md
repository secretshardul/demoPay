# Software test document

##1.authorizer
###Prerequisites
1. Create strong userID and password for *Basic authentication protocol*.
```
Authorization: Basic <Base64('userID:password')>
```
2. Add ```userID:password``` in TextLocal webhook
3. Create parameter ```SMS_API_SECRET``` in serverless dashboard. Access this from serverless.yml file.
4. Access parameter inside Lambda.

###Test cases
| No | Test                                  | Expected | Actual | Comments |
|----|---------------------------------------|----------|--------|----------|
| 1  | Valid Authentication header           | pass     | pass   | success  |
| 2  | Missing Authentication header         | fail     | fail   | success  |
| 3  | Incorrect Authentication header value | fail     | fail   | success  |

##2.router
###Test cases
| No | Test                                      | Expected               | Actual                 | Comments |
|----|-------------------------------------------|------------------------|------------------------|----------|
| 1  | Unregistered user with random message     | /registerMessage route | /registerMessage route | success  |
| 2  | Unregistered user with 'REGISTER' message | /register route        | /register route        | success  |
| 3  | Registered user with 'BROWSE'message      | /browse route          | /browse route          | success  |
| 4  | Registered user with 'PAY'message         | /pay route             | /pay route             | success  |
| 5  | Registered user with 'PASSBOOK'message    | /passbook route        | /passbook route        | success  |
| 6  | Registered user with random message       | /home route            | /home route            | success  |

##3.sendMessage
###Prerequisites
1. Generate textlocal API key.
2. Create parameter ```TEXTLOCAL_API_KEY``` in serverless dashboard and access it from serverless.yml file.
3. Install ```axios``` for POST requests.

###Test cases
| No | Test                                                                                                                       | Expected | Actual | Comments |
|----|----------------------------------------------------------------------------------------------------------------------------|----------|--------|----------|
| 1  | Valid number, non-empty message ```sls invoke -f sendMessage -p test_inputs/sendMessage/valid.json```                      | pass     | pass   | success  |
| 2  | Valid number, empty message ```sls invoke -f sendMessage -p test_inputs/sendMessage/emptyMessage.json```                   | fail     | fail   | success  |
| 3  | Valid number, missing message field ```sls invoke -f sendMessage -p test_inputs/sendMessage/missingMessageField.json```    | fail     | fail   | success  |
| 4  | Invalid number, non-empty message ```sls invoke -f sendMessage -p test_inputs/sendMessage/invalidNumber.json```            | fail     | fail   | success  |
| 5  | Empty number, non-empty message ```sls invoke -f sendMessage -p test_inputs/sendMessage/emptyNumberjson```                 | fail     | fail   | success  |
| 6  | Missing number field, non-empty message ```sls invoke -f sendMessage -p test_inputs/sendMessage/missingNumberField.json``` | fail     | fail   | success  |

##4.register
###Prerequisites
1. Cognito pool created
2. ```cognito-idp:AdminCreateUser``` IAM permission

###Test cases
| No | Test                             | Expected             | Actual               | Comments                                                                                             |
|----|----------------------------------|----------------------|----------------------|------------------------------------------------------------------------------------------------------|
| 1  | Unregistered number              | Registration success | Registration success | Success                                                                                              |
| 2  | Registered number                | Registration failure | Registration failure | Success. Further router makes sure that registered users can't enter this route.                     |
| 3  | Invalid number of correct format | Registration failure | Registration success | Should not be a problem. Lambda is invoked only when SMS webhook is triggered by valid phone number. |
| 4  | Number of incorrect format       | Registration failure | Registration failure | Success                                                                                              |

###Integration testing with router
```shell script
sls invoke local -f router -p test_inputs/router/register.json
```
Success

##5.browse
###Prerequisites
1. DynamoDB catalog table with data.

###Test cases
 | No | Test                                    | Expected                                          | Actual                                            | Comments |
 |----|-----------------------------------------|---------------------------------------------------|---------------------------------------------------|----------|
 | 1  | Database table not empty, valid  number | Catalog message generated                         | Catalog message generated                         | Success  |
 | 2  | Database table empty, valid number      | Catalog message generated but empty               | Catalog message generated but empty               | Success  |
 | 4  | Number field not present                | Throw error, do not invoke 'sendMessage' function | Throw error, do not invoke 'sendMessage' function | Success  |