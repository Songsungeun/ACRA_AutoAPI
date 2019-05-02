var exports = module.exports = {};
var readline = require('readline');
var fs = require('fs');
var date = new Date();

exports.log = function(message) {
    return function(message) {
        console.log(`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds} - ${message}`);
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

exports.readRuleData = function() {
    this.log("규칙을 읽어옵니다. 규칙을 변경할 경우 rule_data.txt 파일을 수정해주세요.")
    console.log("1")
    return new Promise(function (resolve, reject) {
        fs.readFile('./rule_data.txt', 'utf8', function(err, data) {
            resolve(data);
        })      
    })
}

exports.readUserData = function() {
    this.log("")
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
}