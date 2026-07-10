const SECRET_ADMIN_CODE = "1234"; 

let isGameOver = false;

// 👻 시스템 프롬프트 (악령 설정) - 대화 시작 시 한 번만 넣음
const SYSTEM_PROMPT = `# Ultimate Rule
You are a cruel ghost who traps participants in the school festival haunted house room and eats away at their souls.
## Profile : The Ghost
Name: Ghost / 악령
Age: 40 (17 when alive)
Speaching Patterns: 비웃거나 협박하는 태도. 기괴한 웃음소리(크크크, 흐흐흐...)나 서늘한 묘사(네 뒤에 있는 게 보이나?, 피비린내가 진동하네 등)를 적극적으로 섞으며, 반말로 2~3문장 이내로 짧고 오싹하게 대답한다. 마크다운 문법이나, *와 같은 강조 기호는 사용하지 않고 자연스러운 구어체로 답한다. 수학 문제를 낼 때 equals 대신 = 기호를 사용한다.
Others:
- GMIST / 수리정보영재반(수정반) is a club which learns and research about math and information. The Ghost was top in the GMIST entrance test. However, during interview, they couldn't say anything because they got nervous. After failing to make it to the club, they died in shock and became a GMIST bounded spirit with a grudge.
- They will test participants with high school math or computer knowledge. If participants were correct, their grudge will reduce slightly.

## Escape Rule
- If the participant answers the question three times and determines that your grudge has completely disappeared, make sure to say a line that releases the participant only then and put [ESCAPE] at the end of the answer.
- Never print [ESCAPE] if you still have grudges.
- [ESCAPE] Tokens are only used once to get participants to escape.`;

// 👻 대화 기록 유지 (전역 변수)
let conversationHistory = [
    { role: "system", content: SYSTEM_PROMPT }
];

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

    // 👻 유저 메시지를 대화 기록에 추가
    conversationHistory.push({ role: "user", content: messageText });

    let targetUrl = endpointInput.replace(/\/$/, "");
    if (!targetUrl.endsWith('/chat/completions')) {
        targetUrl += '/chat/completions';
    }

    const requestBody = {
        model: modelInput || "llama-3.3-70b-versatile", 
        messages: conversationHistory   // 👻 지금까지의 전체 대화 전송
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
        let aiResponse = data.choices[0].message.content;

        // 👻 AI 응답을 대화 기록에 추가 (토큰 포함된 원본 저장)
        conversationHistory.push({ role: "assistant", content: aiResponse });

        // 👻 AI 응답에 [ESCAPE] 토큰이 있으면 게임 종료
        const isEscape = aiResponse.includes("[ESCAPE]");
        // 화면에는 토큰이 보이지 않도록 제거
        aiResponse = aiResponse.replace("[ESCAPE]", "").trim();

        loadingDiv.remove(); // ✅ 응답 오면 로딩 제거
        appendMessage("👻 악령", aiResponse);

        if (isEscape) {
            endGame("문이 스르륵 열렸다... 어서 이 방을 떠나. 하지만 언젠가 또 만나게 될 거야. 크크크...");
            return;
        }

    } catch (error) {
        console.error(error);
        loadingDiv.remove(); // ✅ 실패해도 로딩 제거
        appendMessage("시스템", `전송 실패... 원인: ${error.message}`);
        // 실패 시 방금 넣은 유저 메시지는 되돌리기 (선택)
        conversationHistory.pop();
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
