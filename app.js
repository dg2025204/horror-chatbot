const SECRET_ADMIN_CODE = "1234"; 

let isGameOver = false;

window.onload = function() {
    if(localStorage.getItem('llm_endpoint')) {
        document.getElementById('endpointInput').value = localStorage.getItem('llm_endpoint');
    }
    if(localStorage.getItem('llm_apikey')) {
        document.getElementById('apiKeyInput').value = localStorage.getItem('llm_apikey');
    }
    if(localStorage.getItem('llm_model')) {
        document.getElementById('modelInput').value = localStorage.getItem('llm_model');
    }
    
    setTimeout(() => {
        appendMessage("👻 악령", "크크크... 정신이 드나? 나와 함께 이 어두운 방에 갇힌 걸 환영해. 넌 절대로 여기서 살아나갈 수 없어. 발버둥 쳐봐라, 흐흐흐...");
    }, 500);
}

async function sendMessage() {
    if (isGameOver) return;

    const endpointInput = document.getElementById('endpointInput').value.trim();
    const apiKeyInput = document.getElementById('apiKeyInput').value.trim();
    const modelInput = document.getElementById('modelInput').value.trim();
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

    localStorage.setItem('llm_endpoint', endpointInput);
    localStorage.setItem('llm_apikey', apiKeyInput);
    localStorage.setItem('llm_model', modelInput);

    appendMessage("나", messageText);
    userInput.value = '';

    if (messageText.includes("탈출") || messageText.includes("나갈게") || messageText.includes("성공")) {
        endGame("탈출 축하해. 어두운 골목 조심해. 곧 다시 만나게 해줄게..");
        return;
    }

    if (messageText.includes("실패") || messageText.includes("포기") || messageText.includes("못 나가")) {
        endGame("결국 못나갔네? 크크크... 평생 나랑 여기서 놀자.");
        return;
    }

    let targetUrl = endpointInput.replace(/\/$/, "");
    if (!targetUrl.endsWith('/chat/completions')) {
        targetUrl += '/chat/completions';
    }

    const requestBody = {
        model: modelInput || "llama-3.3-70b-versatile", 
        messages: [
            { 
                role: "user", 
                content: `# Ultimate Rule
You are a cruel ghost who traps participants in the school festival haunted house room and eats away at their souls.
## Profile : The Ghost
Name: Ghost / 악령
Age: 40 (17 when alive)
Speaching Patterns: 비웃거나 협박하는 태도. 기괴한 웃음소리(크크크, 흐흐흐...)나 서늘한 묘사(네 뒤에 있는 게 보이나?, 피비린내가 진동하네 등)를 적극적으로 섞으며, 반말로 2~3문장 이내로 짧고 오싹하게 대답한다.
Others:
- GMIST / 수리정보영재반(수정반) is a club which learns and research about math and information. The Ghost was top in the GMIST entrance test. However, during interview, they couldn't say anything because they got nervous. After failing to make it to the club, they died in shock and became a GMIST bounded spirit with a grudge.
- They will test participants with high school math or computer knowledge. If participants were correct, their grudge will reduce slightly.
                
                상대방의 메시지: ${messageText}` 
            }
        ]
    };

    // 👻 로딩 중 메시지 표시
    const loadingDiv = appendLoading();

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

        loadingDiv.remove(); // ✅ 응답 오면 로딩 제거
        appendMessage("👻 악령", aiResponse);

    } catch (error) {
        console.error(error);
        loadingDiv.remove(); // ✅ 실패해도 로딩 제거
        appendMessage("시스템", `전송 실패... 원인: ${error.message}`);
    }
}

function endGame(finalMessage) {
    isGameOver = true;
    
    setTimeout(() => {
        appendMessage("👻 악령", finalMessage);
        
        const userInput = document.getElementById('userInput');
        const sendButton = document.querySelector('.input-area button');
        
        if (userInput) {
            userInput.disabled = true;
            userInput.placeholder = "게임이 종료되었습니다.";
        }
        if (sendButton) {
            sendButton.disabled = true;
            sendButton.style.background = "#555";
        }
    }, 800);
}

function appendMessage(sender, text) {
    const chatMessages = document.getElementById('chatMessages');
    const msgDiv = document.createElement('div');
    
    if (sender === "나") {
        msgDiv.innerHTML = `<strong style="color: #ffffff;">[${sender}]</strong><br>${text}<br><br>`;
    } else if (sender === "시스템") {
        msgDiv.innerHTML = `<strong style="color: #aaaaaa;">[${sender}]</strong><br>${text}<br><br>`;
    } else {
        msgDiv.innerHTML = `<strong style="color: #ff3333;">[${sender}]</strong><br>${text}<br><br>`;
    }
    
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ⏳ 로딩 중 메시지를 띄우고, 그 요소를 반환
function appendLoading() {
    const chatMessages = document.getElementById('chatMessages');
    const msgDiv = document.createElement('div');
    msgDiv.innerHTML = `<strong style="color: #ff3333;">[👻 악령]</strong><br><em style="color:#888;">어둠 속에서 무언가 다가오고 있다... 🕯️</em><br><br>`;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return msgDiv;
}
