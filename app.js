async function sendMessage() {
    const endpointInput = document.getElementById('endpointInput').value.trim();
    const apiKeyInput = document.getElementById('apiKeyInput').value.trim();
    const userInput = document.getElementById('userInput');
    const messageText = userInput.value.trim();

    if (!messageText) return;
    if (!endpointInput || !apiKeyInput) {
        alert("설정 창에 API 엔드포인트와 키를 입력해주세요!");
        return;
    }

    // 화면에 사용자 메시지 표시
    appendMessage("나", messageText);
    userInput.value = '';

    // 엔드포인트 주소 자동 보정
    let targetUrl = endpointInput;
    if (!targetUrl.endsWith('/chat/completions')) {
        targetUrl = targetUrl.replace(/\/$/, '') + '/chat/completions';
    }

    try {
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKeyInput}` // Groq API 키가 들어갑니다
            },
            body: JSON.stringify({
                // 🔥 Groq에서 지원하는 고성능 무료 모델로 변경했습니다.
                model: "llama3-8b-8192", 
                messages: [
                    { 
                        role: "system", 
                        content: "너는 학교 축제 귀신의 집에서 탈출하려는 사람을 방해하는 기괴하고 서늘한 공포 챗봇이야. 짧고 소름 끼치는 말투로 대답해줘." 
                    },
                    { role: "user", content: messageText }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP 에러 발생! 상태코드: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        
        appendMessage("령(👻)", aiResponse);

    } catch (error) {
        console.error(error);
        appendMessage("시스템", "전송 실패... 무언가 잘못되었습니다.");
    }
}

function appendMessage(sender, text) {
    const chatMessages = document.getElementById('chatMessages');
    const msgDiv = document.createElement('div');
    msgDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
