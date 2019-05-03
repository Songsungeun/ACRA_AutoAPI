
var lib = require('./func');
var fs = require('fs');
var log = lib.log();
var auth = {};
var ruleData, userData, nodeData, targetAccountData;
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
}).then(function(readRuleData) {
    log("Rule Loading Complete");
    ruleData = readRuleData;
    log("규칙을 확인하세요.");
    console.log(ruleData);
    return lib.getUserData();
}).then(function(readUserData) {
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
        requestData.url = `/accounts?filter={"$and":[{},{"NodeKey":"${nodeData[i]}"}]}`
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
    
    for (let i = 0, len = nodeData.length; i < len; i++) {
        log(`${i+1} 번째 노드의 토큰 규칙 신청 합니다.`);
        log(`NodeKey ==> ${nodeData[i]}`);
        log(`Accounts Length ===> ${Object.keys(accountsData[nodeData[i]]).length}`);

        for (let j = 0, len = Object.keys(accountsData[nodeData[i]]).length; j < len; j++) {
            log(`${i+1}-${j+1} => accountName is ${accountsData[nodeData[i]][j].AccountName}`);
            requestData.url = `/accounts/${accountsData[nodeData[i]][j].AccountObjectId}/rules`
            log(`requestURL = ${requestData.url}`);
            let response = await lib.apiRequest(requestData, auth, {msg: ruleData});
            log(`응답 결과: `)
            console.log(response)
        }
    }
    log(`Token 규칙 적용 완료`);
}).catch(function(err) {
    log("error!!!!");
    log(err)
})
// Todo 
/*
    Rule 의 User에 해당 UserID 꽂히도록 (QA서버 User 등록후)
    Token Rule Complete
    IP 정책 API 생성
*/