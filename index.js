
var lib = require('./func');
var fs = require('fs');
var log = lib.log();
var auth = {};
var ruleData, ipRuleData, userData, nodeData;
var totalAccounts = {};

console.log("==================================================");
console.log("예외정책 자동 API 입력을 시작합니다.")
console.log("==================================================");

lib.readAuth().then(function(authData) { // 아이디와 비밀번호 입력
    console.log("***********************************");
    console.log(authData);
    console.log("***********************************");
    auth['id'] = authData['id'];
    auth['pw'] = authData['pw'];
    return lib.confirmAuth();
}).then(function(result) {
    if (result) { return lib.getRuleData(); } // 예외규칙 Read
}).then(function(rules) {
    log("Rule Loading Complete");
    ruleData = rules.token;
    ipRuleData = rules.ip;
    log("토큰 규칙을 확인하세요.");
    console.log(ruleData);
    log("ip 규칙을 확인하세요.");
    console.log(ipRuleData);
    return lib.getUserData();
})
.then(function(readUserData) {
    log("User Loading Complete");
    userData = readUserData;
    log("사용자리스트를 확인하세요.");
    console.log(userData);
    log(`사용자 수: ${Object.keys(userData).length}`)
    return lib.getNodeKeyList();
}).then(async function(readNodeData) {
    log("NodeKey Loading Complete");
    nodeData = readNodeData;
    log("노드리스트를 확인하세요.");
    console.log(nodeData);
    log(`노드 개수: ${nodeData.length}`);

    let requestData = {
        method: 'GET',
    };
    // 각 노드의 계정들을 전부 가져오기 위해 각 노드키 별로 요청
    log(`각 노드별 계정을 요청합니다.`);
    for (let i = 0, len = nodeData.length; i < len; i++) {
        // 해당 노드키로 URI 변경
        requestData.url = `/accounts?filter={"$and":[{},{"NodeKey":"${nodeData[i]}"}]}`
        // 해당 노드의 계정 리스트를 가져온다
        let accounts = await lib.apiRequest(requestData, auth);
        let data = JSON.parse(accounts);
        let msg = Buffer.from(data.msg, 'base64').toString();
        let result = JSON.parse(msg);
        // 신규 사용자 계정만 추출
        let filteredAccountData = await lib.targetAccountFilter(result, userData);

        totalAccounts[nodeData[i]] = filteredAccountData;
        log(`${nodeData[i]}의 계정 개수 = ${Object.keys(totalAccounts[nodeData[i]]).length}`);
    }

    return new Promise(function(resolve, reject) {
        resolve(totalAccounts)
    })
}).then(async function(accountsData) {
    let requestData = {
        method: 'POST',
    };

    let jsonRuleData = JSON.parse(ruleData);
    for (let i = 0, len = nodeData.length; i < len; i++) {
        log(`${i+1} 번째 노드의 토큰 규칙 신청 합니다.`);
        log(`NodeKey ==> ${nodeData[i]}`);
        log(`Accounts Length ===> ${Object.keys(accountsData[nodeData[i]]).length}`);
        
        for (let j = 0, len = Object.keys(accountsData[nodeData[i]]).length; j < len; j++) {
            log(`${i+1}-${j+1} => accountName is ${accountsData[nodeData[i]][j].AccountName}`);

            // 변경할 RuleData의 UserID에 현재 사용자 아이디 꽂아줌
            jsonRuleData.UserID = accountsData[nodeData[i]][j].AccountName;
            requestData.url = `/accounts/${accountsData[nodeData[i]][j].AccountObjectId}/rules`;
            log(`requestURL = ${requestData.url}`);

            // 변경 API Request
            let response = await lib.apiRequest(requestData, auth, {msg: JSON.stringify(jsonRuleData)});
            log(`응답 결과: `)
            console.log(response);
        }
    }
    log(`Token 규칙 적용 완료`);
    console.log("=====================================================");

    return new Promise(function(resolve, reject) {
        resolve(totalAccounts)
    })
}).then(async function(accountsData) {
    let requestData = {
        method: 'POST',
    };

    let jsonIPRuleData = JSON.parse(ipRuleData);

    for (let i = 0, len = nodeData.length; i < len; i++) {
        log(`${i+1} 번째 노드의 ip 규칙 신청 합니다.`);
        log(`NodeKey ==> ${nodeData[i]}`);
        log(`Accounts Length ===> ${Object.keys(accountsData[nodeData[i]]).length}`);

        for (let j = 0, len = Object.keys(accountsData[nodeData[i]]).length; j < len; j++) {
            log(`${i+1}-${j+1} => ${accountsData[nodeData[i]][j].AccountName} - ${accountsData[nodeData[i]][j].IP}`);

            // 변경할 RuleData의 ip에 현재 사용자 ip 꽂아줌
            jsonIPRuleData.RuleIP = accountsData[nodeData[i]][j].IP;
            requestData.url = `/accounts/${accountsData[nodeData[i]][j].AccountObjectId}/rules`;
            log(`requestURL = ${requestData.url}`);

            // 변경 API Request
            let response = await lib.apiRequest(requestData, auth, {msg: JSON.stringify(jsonIPRuleData)});
            log(`응답 결과: `)
            console.log(response);
        }
    }
    log(`ip 규칙 적용 완료`);
}).catch(function(err) {
    log("error!!!!");
    log(err)
})
