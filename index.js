var http = require('http');
var readline = require('readline');
var fs = require('fs');
var xlsx = require('xlsx');
var querystring = require('querystring');
var charset = require('charset');
var iconv = require('iconv-lite');

var ruleData;
var userData = [];
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

// input 읽기
// rl.question('Please enter a color? ', function(value) {
//     let color = value;
//     console.log(`You entered $(color): ` + color);
//     rl.close();
// })

// 엑셀 데이터 읽기
let workbook = xlsx.readFile(__dirname + "/user_list.xlsx");
let worksheet = workbook.Sheets["Sheet2"]

// 불필요 엑셀 데이터 제거
delete worksheet['!ref'];
delete worksheet['!margins'];

for (var i = 1, len = Object.keys(worksheet).length / 3; i <= len; i++) {
    let obj = {};
    obj.Name = worksheet['A'+i]['v'];
    obj.account = worksheet['B'+i]['v'];
    obj.ip = worksheet['C'+i]['v'];
    userData.push(obj);
}

console.log(userData);

function readRuleData() {
    return new Promise(function (resolve, reject) {
        fs.readFile('rule_data', 'utf8', function(err, data) {
            resolve(data);
        })      
    })
}

var hardData ={
    RuleBlackOrWhite:"1",
    ValidWeekDays:"1111111",
    ValidtoDate:"",
    ValidHours:"111111111111111111111111",
    UserID:"acrauser",
    ValidfromDate:"",
    RuleType:"SC",
    RulePriority:"1",
    RuleSecret:""
} 

var hardRuleData = JSON.stringify(hardData);
var stringifyJsonData = { msg: hardRuleData}
// Rule 읽어오고 UserID를 변경해준다.
readRuleData().then(function(data) {
    // ruleData = eval("(" + data + ")");
    // console.log(data)
})

var options = {
    hostname: '192.168.100.198',
    port: 8883,
    path: '/accounts/a3d6e739714c422693c8da844e8bde00_YWRt/rules',
    headers: {Authorization: 'Basic YXBhZG1pbjpka3RuZmshIQ=='},
}

bufferData = querystring.stringify(stringifyJsonData);

options['headers']['Content-Type'] = 'application/x-www-form-urlencoded';
options['headers']['Content-Length'] = Buffer.byteLength(bufferData);
options['headers']['connection'] = 'close';

function handleResponse(res) {
    var serverData = '';
    
    res.on('data', function (chunk) {
        var enc = charset(res.headers, serverData);
        serverData += iconv.decode(chunk, enc);
    });

    res.on('end', function() {
        console.log('data : ' + serverData)
        console.log("http statusCode : " + res.statusCode);
        console.log('http header : ');
        console.log(res.headers)
    });
}

var req = http.request(options, function(response) {
    handleResponse(response);
});

req.write(bufferData);

req.end();