const SECRET_ADMIN_CODE = "123456789"; 

window.onload = function() {
    if(localStorage.getItem('groq_endpoint')) {
        document.getElementById('endpointInput').value = localStorage.getItem('groq_endpoint');
    }
    if(localStorage.getItem('groq_apikey')) {
        document.getElementById('apiKeyInput').value = localStorage.getItem('groq_apikey');
    }
}

async function sendMessage() {
    const endpointInput = document.getElementById('endpointInput').value.trim();
    const apiKeyInput = document.getElementById('apiKeyInput').value.trim();
    const userInput = document.getElementById('userInput');
    const messageText = userInput.value.trim();

    if (!messageText) return;

    if (messageText === SECRET_ADMIN_CODE) {
        const settingsDiv = document.getElementById('adminSettings');
        if (settingsDiv.style.style.display === 'block' || settingsDiv.style.display === 'block') {
            settingsDiv.style.display = 'none';
            alert("관리자 설정창을 숨겼습니다.");
        } else {
            settingsDiv.style.display = 'block';
            alert("관리자 설정창이 활성화되었습니다!");
        }
        userInput.value = '';
        return;
    }

    if (!endpointInput || !apiKeyInput) {
        alert("관리자 설정을 먼저 완료해주세요! (비밀 코드를 채팅창에 입력)");
        return;
    }

    localStorage.setItem('groq_endpoint', endpointInput);
    localStorage.setItem('groq_apikey', apiKeyInput);

    appendMessage("나", messageText);
    userInput.value = '';

    // 엔드포인트 주소 끝에 슬래시와 경로 완벽 정리
    let targetUrl = endpointInput.replace(/\/$/, "");
    if (!targetUrl.endsWith('/chat/completions')) {
        targetUrl += '/chat/completions';
    }

    // 전송할 데이터 구조 (Groq 표준 규격)
    const requestBody = {
        model: "gemma2-9b-it", // 현재 가라앉지 않고 잘 작동하는 기본 모델
        messages: [
            { 
                role: "user", 
                content: `너는 학교 축제 귀신의 집 방에 참가자를 가둔 서늘한 악령이야. 상대방의 말에 기괴하고 서늘한 분위기를 풍기며 2~3문장 이내로 짧고 오싹하게 반말로 대답해줘. 상대방의 메시지: ${messageText}` 
            }
        ]
    };

    try {
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKeyInput}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            // 400 에러의 실제 원인을 텍스트로 강제 파싱해서 확인
            const errorText = await response.text();
            throw new Error(`상태코드 ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        
        appendMessage("👻 악령", aiResponse);

    } catch (error) {
        console.error(error);
        appendMessage("시스템", `전송 실패... 원인: ${error.message}`);
    }
}

function appendMessage(sender, text) {
    const chatMessages = document.getElementById('chatMessages');
    const msgDiv = document.createElement('div');
    
    if (sender === "나") {
        msgDiv.innerHTML = `<strong style="color: #ffffff;">[${sender}]</strong><br>${text}<br><br>`;
    } else {
        msgDiv.innerHTML = `<strong style="color: #ff3333;">[${sender}]</strong><br>${text}<br><br>`;
    }
    
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
