// 🤫 관리자 설정창을 여는 비밀 코드 (원하는 단어로 바꿔도 돼!)
const SECRET_ADMIN_CODE = "123456789"; 

async function sendMessage() {
    const endpointInput = document.getElementById('endpointInput').value.trim();
    const apiKeyInput = document.getElementById('apiKeyInput').value.trim();
    const userInput = document.getElementById('userInput');
    const messageText = userInput.value.trim();

    if (!messageText) return;

    // 🔑 사용자가 채팅창에 비밀 코드를 입력했을 때 처리
    if (messageText === SECRET_ADMIN_CODE) {
        const settingsDiv = document.getElementById('adminSettings');
        if (settingsDiv.style.display === 'block') {
            settingsDiv.style.display = 'none';
            alert("관리자 설정창을 숨겼습니다.");
        } else {
            settingsDiv.style.display = 'block';
            alert("관리자 설정창이 활성화되었습니다!");
        }
        userInput.value = ''; // 입력창 비우기
        return; // AI에게 메시지를 보내지 않고 여기서 함수 종료
    }

    // 일반 채팅일 때 API 설정 체크
    if (!endpointInput || !apiKeyInput) {
        alert("관리자 설정을 먼저 완료해주세요! (비밀 코드를 채팅창에 입력)");
        return;
    }

    appendMessage("나", messageText);
    userInput.value = '';

    let targetUrl = endpointInput;
    if (!targetUrl.endsWith('/chat/completions')) {
        targetUrl = targetUrl.replace(/\/$/, '') + '/chat/completions';
    }

    try {
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKeyInput}`
            },
            body: JSON.stringify({
                model: "llama3-8b-8192", 
                messages: [
                    { 
                        role: "system", 
                        content: "너는 학교 축제 귀신의 집 방에 참가자를 가둔 소름 돋는 악령이야. 문맥에 맞는 자연스러운 한국어로 대답하되, 기괴하고 서늘한 분위기를 풍기며 2~3문장 이내로 짧고 오싹하게 반말로 대답해줘." 
                    },
                    { role: "user", content: messageText }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP 에러! 상태코드: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        
        appendMessage("👻 악령", aiResponse);

    } catch (error) {
        console.error(error);
        appendMessage("시스템", "전송 실패... 무언가 잘못되었습니다.");
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
