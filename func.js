var exports = module.exports = {};
var readline = require('readline');
var fs = require('fs');
var xlsx = require('xlsx');
var http = require('http');
var querystring = require('querystring');
var charset = require('charset');
var iconv = require('iconv-lite');
var date = new Date();
var path = {};
// 외부 파일 경로 바인딩
(function() {
    fs.readFile('./path_config.txt', 'utf8', function(err, data) {
        jsonData = JSON.parse(data);
        path['rule_data'] = jsonData['rule_data'];
        path['excel_list'] = jsonData['excel_list'];
        path['user_sheet'] = jsonData['user_sheet'];
        path['node_sheet'] = jsonData['node_sheet'];
    })
})();

exports.log = function(message) {
    return function(message) {
        console.log(`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()} - ${message}`);
    }
};

exports.readAuth = function() {
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    var authData = {};
    return new Promise(function(resolve, reject) {
        
        rl.question('관리자 계정을 입력하세요 : ', (id) => {
            rl.question('관리자 비밀번호를 입력하세요 : ', (pw) => {
                authData.id = id;
                authData.pw = pw;
                rl.close();
                resolve(authData);
            });
        });
    })
};

exports.confirmAuth = function() {
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    return new Promise(function(resolve, reject) {
        rl.question('계정과 비밀번호가 맞습니까? (y or n): ', (confirm) => {
            if (confirm === "yes" || confirm==="y") {
                resolve(true)
            } else {
                console.log("Process를 종료합니다.");
                process.exit();
            }
            rl.close();
        });

    })
}

exports.getRuleData = function() {
    return new Promise(function (resolve, reject) {
        // log("규칙을 읽어옵니다. 규칙을 변경할 경우 rule_data.txt 파일을 수정해주세요.")
        fs.readFile(path['rule_data'], 'utf8', function(err, data) {
            resolve(data);
        })      
    })
}

exports.getUserData = function() {
    return new Promise(function(resolve, reject) {
        // log("사용자 데이터를 읽어옵니다.")
        var userData = [];
        let workbook = xlsx.readFile(__dirname + path['excel_list']);
        let worksheet = workbook.Sheets[path['user_sheet']]

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
        
        resolve(userData);
    })
}

exports.getNodeKeyList = function() {
    return new Promise(function(resolve, reject) {
        // log("사용자 데이터를 읽어옵니다.")
        var nodeData = [];
        let workbook = xlsx.readFile(__dirname + path['excel_list']);
        
        let worksheet = workbook.Sheets[path['node_sheet']]
        
        // 불필요 엑셀 데이터 제거
        delete worksheet['!ref'];
        delete worksheet['!margins'];
        
        for (var i = 1, len = Object.keys(worksheet).length; i <= len; i++) {
            let obj = {};
            nodeData.push(worksheet['A'+i]['v'])
        }
        console.log(nodeData)
        resolve(nodeData);
    })
}

exports.apiRequest = function(requestData, auth, paramData) { // requestData => JsonData {url, method}
    
    return new Promise(function(resolve, reject) {
        var encodedAuth = Buffer.from(`${auth['id']}:${auth['pw']}`).toString('base64');

        var options = {
            hostname: '192.168.100.198',
            port: 8883,
            path: requestData['url'],
            headers: {Authorization: `Basic ${encodedAuth}`},
            method: requestData['method']
        }

        // bufferData = querystring.stringify(stringifyJsonData);

        options['headers']['Content-Type'] = 'application/x-www-form-urlencoded';
        // options['headers']['Content-Length'] = Buffer.byteLength(bufferData);
        options['headers']['connection'] = 'close';

        function handleResponse(res) {
            var serverData = '';
            
            res.on('data', function (chunk) {
                var enc = charset(res.headers, serverData);
                serverData += iconv.decode(chunk, enc);
            });

            res.on('end', function() {
                // console.log('data : ' + serverData)
                // console.log("http statusCode : " + res.statusCode);
                // console.log('http header : ');
                // console.log(res.headers)
                resolve(serverData)
            });
        }

        var req = http.request(options, function(response) {
            handleResponse(response);
        });

        // req.write(bufferData);
        req.end();
        })
}