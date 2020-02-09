//uses Javascript standard style
exports.handler = function (event, context, callback) {
    var authorizationHeader = event.headers.Authorization

    if (!authorizationHeader) return callback('Unauthorized')
    /**Authorization header contains
     * Authorization: Basic <base64(userid:password)>
     *
     * Compare with environment variable SMS_API_SECRET
     */
    var encodedCreds = authorizationHeader.split(' ')[1] //remove 'Basic' in front
    var buff = Buffer.from(encodedCreds, 'base64')
    var plainCreds = buff.toString('utf-8')

    if (plainCreds !== process.env.SMS_API_SECRET) return callback('Unauthorized')

    var username = plainCreds[0]
    var authResponse = buildAllowAllPolicy(event, username)

    callback(null, authResponse)
}

function buildAllowAllPolicy (event, principalId) {
    var tmp = event.methodArn.split(':')
    var apiGatewayArnTmp = tmp[5].split('/')
    var awsAccountId = tmp[4]
    var awsRegion = tmp[3]
    var restApiId = apiGatewayArnTmp[0]
    var stage = apiGatewayArnTmp[1]
    var apiArn = 'arn:aws:execute-api:' + awsRegion + ':' + awsAccountId + ':' +
        restApiId + '/' + stage + '/*/*'
    const policy = {
        principalId: principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: 'Allow',
                    Resource: [apiArn]
                }
            ]
        }
    }
    return policy
}
