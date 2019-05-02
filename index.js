var http = require('http');
var fs = require('fs');
var xlsx = require('xlsx');
var querystring = require('querystring');
var charset = require('charset');
var iconv = require('iconv-lite');
var lib = require('./func');

var log = lib.log();
var ruleData;
var id, pw;
var userData = [];

console.log("==================================================");
console.log("예외정책 자동 API 입력을 시작합니다.")
console.log("==================================================");

lib.readAuth().then(function(authData) {
    console.log("******************************");
    console.log(authData);
    console.log("******************************");
    return lib.confirmAuth();
}).then(function(result) {
    if (result) { return lib.readRuleData(); }
}).then(function(readRuleData) {
    console.log("2")
    log("Rule Loading Complete");
    log("규칙을 Setting 합니다.")
    ruleData = readRuleData;
    console.log(readRuleData)
    
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
// // Rule 읽어오고 UserID를 변경해준다.
// readRuleData().then(function(data) {
//     // ruleData = eval("(" + data + ")");
//     // console.log(data)
// })


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