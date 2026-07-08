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
                // 💡 한국어를 훨씬 더 매끄럽고 똑똑하게 잘하는 고성능 모델로 변경
                model: "llama-3.3-70b-specdec", 
                messages: [
                    { 
                        role: "system", 
                        content: "너는 학교 축제 귀신의 집방에 갇힌 사람을 협박하고 괴롭히는 소름 돋는 악령이야. 문맥에 맞는 자연스러운 한국어로 대답하되, 절대로 친절하게 대하지 마. 오싹하고 기괴한 분위기를 풍기며 2~3문장 이내로 짧고 서늘하게 반말로 대답해." 
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
        
        // 💡 이름을 '령(👻)' 대신 조금 더 분위기 있게 '악령'으로 바꾸고 보기 편하게 수정
        appendMessage("👻 악령", aiResponse);

    } catch (error) {
        console.error(error);
        appendMessage("시스템", "전송 실패... 무언가 잘못되었습니다.");
    }
}

function appendMessage(sender, text) {
    const chatMessages = document.getElementById('chatMessages');
    const msgDiv = document.createElement('div');
    // 💡 이름과 내용 사이에 줄바꿈(<br>)을 넣어서 가독성을 높임
    msgDiv.innerHTML = `<strong style="color: #ff3333;">[${sender}]</strong><br>${text}<br><br>`;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
