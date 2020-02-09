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

