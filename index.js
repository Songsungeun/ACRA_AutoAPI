var http = require('http');
var readline = require('readline');
var fs = require('fs');
var xlsx = require('xlsx');

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
// console.log(userData);
// function readRuleData() {
//     return new Promise(function (resolve, reject) {
//         fs.readFile('user_list.xlsx', 'utf8', function(err, data) {
//             resolve(data);
//         })      
//     })
// }

// Rule 읽어오고 UserID를 변경해준다.
// readRuleData().then(function(data) {
//     // ruleData = eval("(" + data + ")");
//     console.log(data)
// })

var options = {
    hostname: '192.168.100.198',
    port: 8883,
    path: '/mytodolists?filter={"$and":[{}]}'
}


function handleResponse(res) {
    var serverData = '';
    
    res.on('data', function (chunk) {
        serverData += chunk;
    });

    res.on('end', function() {
        console.log("received server data: ");
        console.log(serverData);
    });
}

// http.request(options, function(response) {
//     handleResponse(response);
// }).end();