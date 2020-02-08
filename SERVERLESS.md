# Common commands
```sh
serverless create --template aws-nodejs #initialize template
sls invoke -f hello -d '{"sent": "mydata"}' -l #invoke Lambda function 'hello' with JSON and track logs. No API gateway.
sls invoke local -f hello -d '{"sent": "mydata"}' -l #invoke locally

curl https://52ucekeeda.execute-api.ap-south-1.amazonaws.com/dev/users/create #invoke API gateway+Lambda with CURL

sls remove #remove deployed service from provider
sls package -p packageFolder #create zip package in packageFolder without deploying
```

# About framework
- **custom-resource-apigw-cw-role**: For sending logs to serverless dashboard. 


# Function and module management
- **app vs services**: Services are independent projects, each with a separate ```serverless.yml``` file. An app groups together multiple services. For small projects it is better to use single service for multiple functions.
- Single .js file can be source of multiple handlers. But this is a bad practice because all handlers get imported into every Lambda.
- Separate .js files: Other handlers and modules also get imported.

## Find way so that each Lambda gets only relevant files
1. **Directory structure**: Each function handler in separate folder.
```
.
├── src
    ├── function1
    │   └── handler.js
    └── function2
        └── handlerTwo.js

```
All files are excluded by default. Each function includes files from its own folder only.
```yaml
package:
  exclude:
    - ./**
  individually: true

functions:
  hello:
    handler: src/function1/handler.hello
    include: src/function1/**
```
2. **Modules**: Installed plugin ```serverless-plugin-include-dependencies``` which adds modules only to those handlers which need them.

 
# Adding modules
Modules added using ```npm install```. node_modules folder should get uploaded.
```shell script
serverless plugin install --name serverless-plugin-include-dependencies
```
Set individual packaging as true.
```yaml
package:
  exclude:
    - ./**
  individually: true
```
