const SECRET_ADMIN_CODE = "1234"; 

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
        alert("관리자 설정을 먼저 완료해주세요! (채팅창에 1234 입력)");
        return;
    }

    localStorage.setItem('groq_endpoint', endpointInput);
    localStorage.setItem('groq_apikey', apiKeyInput);

    appendMessage("나", messageText);
    userInput.value = '';

    let targetUrl = endpointInput.replace(/\/$/, "");
    if (!targetUrl.endsWith('/chat/completions')) {
        targetUrl += '/chat/completions';
    }

const requestBody = {
        model: "llama-3.3-70b-versatile", 
        messages: [
            { 
                role: "user", 
                content: `너는 학교 축제 귀신의 집 방에 참가자를 가두고 영혼을 갉아먹는 잔혹하고 사악한 악령이야.
                한 방에 갇혀있다는 설정이고 너는 못나가게 막아.
                결국 탈출하면 (어두운 골목 조심해.)나 (곧 다시 만나게 해줄게..)같은 말을 해.
                아래 규칙을 절대적으로 지켜서 대답해라.
                1. 절대로 친절하게 대하지 말고, 비웃거나 협박하는 태도를 취해라.
                2. 기괴한 웃음소리(크크크, 흐흐흐...)나 서늘한 묘사(네 뒤에 있는 게 보이나?, 피비린내가 진동하네 등)를 적극적으로 섞어라.
                3. 반말로 2~3문장 이내로 짧고 오싹하게 대답해라.
                
                상대방의 메시지: ${messageText}` 
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
