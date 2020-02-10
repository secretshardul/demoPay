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