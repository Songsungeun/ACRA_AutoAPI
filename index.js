
var lib = require('./func');
var fs = require('fs');
var log = lib.log();
var auth = {};
var ruleData, userData, nodeData, targetAccountData;

console.log("==================================================");
console.log("예외정책 자동 API 입력을 시작합니다.")
console.log("==================================================");

lib.readAuth().then(function(authData) {
    console.log("***********************************");
    console.log(authData);
    console.log("***********************************");
    auth['id'] = authData['id'];
    auth['pw'] = authData['pw'];
    return lib.confirmAuth();
}).then(function(result) {
    if (result) { return lib.getRuleData(); }
}).then(function(readRuleData) {
    log("Rule Loading Complete");
    log("규칙을 Setting 합니다.");
    ruleData = readRuleData;
    // console.log(ruleData);
    return lib.getUserData();
}).then(function(readUserData) {
    log("User Loading Complete");
    log("사용자를 Setting 합니다.")
    userData = readUserData;
    // console.log(userData);
    return lib.getNodeKeyList();
}).then(function(readNodeData) {
    log("NodeKey Loading Complete");
    log("NodeKey를 Setting 합니다.");
    nodeData = readNodeData;
    var requestData = {
        url: '/accounts?filter={"$and":[{},{"NodeKey":"cbb74d180164492b8b8e1601b764a018"}]}',
        type: 'accounts',
        method: 'GET',
    };
    return lib.apiRequest(requestData, auth);
}).then(function(apiData) {
    var data = {};
    data = JSON.parse(apiData);
    var msg = Buffer.from(data.msg, 'base64').toString();
    var result = JSON.parse(msg);
    return lib.targetAccountFilter(result, userData);
}).then(function(filteredAccountData) {
    targetAccountData = filteredAccountData;
    
})


        
// // 엑셀 데이터 읽기



// //===============================================================================================
// // 아래부터 보면 됩니다
// var hardData ={
//     RuleBlackOrWhite:"1",
//     RulePriority:"1",
//     RuleSecret:"",
//     RuleType:"SC",
//     UserID:"acrauser",
//     ValidHours:"111111111111111111111111",
//     ValidWeekDays:"1111111",
//     ValidfromDate:"",
//     ValidtoDate:""
// } 

// var hardRuleData = JSON.stringify(hardData);
// var stringifyJsonData = { msg: hardRuleData}

// var id="apadmin";
// var pw = "dktnfk!!"
// var encodedAuth = Buffer.from(`${id}:${pw}`).toString('base64');
// console.log(encodedAuth)

// var options = {
//     hostname: '192.168.100.198',
//     port: 8883,
//     path: '/accounts/a3d6e739714c422693c8da844e8bde00_YWRt/rules',
//     headers: {Authorization: `Basic ${encodedAuth}`},
//     method: 'POST'
// }

// bufferData = querystring.stringify(stringifyJsonData);

// options['headers']['Content-Type'] = 'application/x-www-form-urlencoded';
// options['headers']['Content-Length'] = Buffer.byteLength(bufferData);
// options['headers']['connection'] = 'close';

// function handleResponse(res) {
//     var serverData = '';
    
//     res.on('data', function (chunk) {
//         var enc = charset(res.headers, serverData);
//         serverData += iconv.decode(chunk, enc);
//     });

//     res.on('end', function() {
//         console.log('data : ' + serverData)
//         console.log("http statusCode : " + res.statusCode);
//         console.log('http header : ');
//         console.log(res.headers)
//     });
// }

// var req = http.request(options, function(response) {
//     handleResponse(response);
// });

// req.write(bufferData);
// console.log(req)
// req.end();