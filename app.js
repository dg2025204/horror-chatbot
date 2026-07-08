const SECRET_ADMIN_CODE = "옵픈세사미123!"; 

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
        if (settingsDiv.style.display === 'block') {
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
                // 💡 400 에러를 피하기 위해 Groq의 최신 범용 무료 모델로 변경
                model: "gemma2-9b-it", 
                messages: [
                    { 
                        role: "system", 
                        content: "너는 학교 축제 귀신의 집 방에 참가자를 가둔 소름 돋는 악령이야. 문맥에 맞는 자연스러운 한국어로 대답하되, 기괴하고 서늘한 분위기를 풍기며 2~3문장 이내로 짧고 오싹하게 반말로 대답해줘." 
                    },
                    { role: "user", content: messageText }
                ],
                // 안전을 위해 파라미터 추가
                temperature: 0.7
            })
        });

        if (!response.ok) {
            // 에러 세부 원인을 알아내기 위해 서버의 답변을 읽어옴
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.error?.message || `상태코드: ${response.status}`;
            throw new Error(errorMsg);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        
        appendMessage("👻 악령", aiResponse);

    } catch (error) {
        console.error(error);
        // 에러 원인을 화면에 직접 띄워주도록 수정
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
