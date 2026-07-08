// 🤫 비밀 단축키 기능: Ctrl + Shift + S 를 누르면 설정창이 켜지고 꺼집니다.
window.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
        const settingsDiv = document.getElementById('adminSettings');
        if (settingsDiv.style.display === 'block') {
            settingsDiv.style.display = 'none';
        } else {
            settingsDiv.style.display = 'block';
        }
    }
});

async function sendMessage() {
    const endpointInput = document.getElementById('endpointInput').value.trim();
    const apiKeyInput = document.getElementById('apiKeyInput').value.trim();
    const userInput = document.getElementById('userInput');
    const messageText = userInput.value.trim();

    if (!messageText) return;
    if (!endpointInput || !apiKeyInput) {
        alert("시크릿 창을 열어 API 엔드포인트와 키를 입력해주세요! (단축키: Ctrl+Shift+S)");
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
                model: "llama-3.3-70b-specdec", 
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
        
        // 👻 확실하게 이름 출력부를 고정시켰습니다.
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
