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

    // 친구가 요청한 OpenAI Compatible 규격으로 주소 조립
    // 사용자가 입력한 엔드포인트 끝에 /chat/completions가 없다면 붙여줍니다.
    let targetUrl = endpointInput;
    if (!targetUrl.endsWith('/chat/completions')) {
        targetUrl = targetUrl.replace(/\/$/, '') + '/chat/completions';
    }

    try {
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKeyInput}` // 입력받은 API 키 사용
            },
            body: JSON.stringify({
                model: "gpt-4o-mini", // 혹은 엔드포인트가 지원하는 모델명 (예: gpt-3.5-turbo 등)
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
        
        // 화면에 챗봇 답변 표시
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
    chatMessages.scrollTop = chatMessages.scrollHeight; // 스크롤 맨 아래로
}
