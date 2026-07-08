const SECRET_ADMIN_CODE = "1234"; 

// 🎮 게임 상태 관리 변수들
let isGameOver = false; // 게임이 끝났는지 체크 (성공/실패 시 true)

window.onload = function() {
    if(localStorage.getItem('groq_endpoint')) {
        document.getElementById('endpointInput').value = localStorage.getItem('groq_endpoint');
    }
    if(localStorage.getItem('groq_apikey')) {
        document.getElementById('apiKeyInput').value = localStorage.getItem('groq_apikey');
    }
    
    // 👻 게임 시작 시 악령이 먼저 상황을 설명하는 대사를 띄웁니다.
    setTimeout(() => {
        appendMessage("👻 악령", "크크크... 정신이 드나? 나와 함께 이 어두운 방에 갇힌 걸 환영해. 넌 절대로 여기서 살아나갈 수 없어. 발버둥 쳐봐라, 흐흐흐...");
    }, 500);
}

async function sendMessage() {
    // 🚫 게임이 이미 끝났다면 함수를 종료하고 더 이상 진행하지 않음
    if (isGameOver) return;

    const endpointInput = document.getElementById('endpointInput').value.trim();
    const apiKeyInput = document.getElementById('apiKeyInput').value.trim();
    const userInput = document.getElementById('userInput');
    const messageText = userInput.value.trim();

    if (!messageText) return;

    // 🔑 관리자 비밀번호 처리
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

    // 🚪 1. 유저가 탈출(성공)을 언급했을 때
    if (messageText.includes("탈출") || messageText.includes("나갈게") || messageText.includes("성공")) {
        endGame("탈출 축하해. 어두운 골목 조심해. 곧 다시 만나게 해줄게..");
        return;
    }

    // 💀 2. 유저가 실패/포기를 언급했을 때
    if (messageText.includes("실패") || messageText.includes("포기") || messageText.includes("못 나가")) {
        endGame("결국 못나갔네? 크크크... 평생 나랑 여기서 놀자.");
        return;
    }

    // --- 일반 대화일 때 AI 요청 보냄 ---
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
                한 방에 같이 갇혀있다는 설정이고 너는 상대가 못나가게 비웃고 방해해야 해.
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

// 🎬 게임 종료 처리 함수 (채팅창을 막아버림)
function endGame(finalMessage) {
    isGameOver = true;
    
    // 악령의 최종 대사 출력
    setTimeout(() => {
        appendMessage("👻 악령", finalMessage);
        
        // HTML 입력창과 버튼을 못 쓰게 비활성화(disabled) 처리
        const userInput = document.getElementById('userInput');
        const sendButton = document.querySelector('.input-area button');
        
        if (userInput) {
            userInput.disabled = true;
            userInput.placeholder = "게임이 종료되었습니다.";
        }
        if (sendButton) {
            sendButton.disabled = true;
            sendButton.style.background = "#555"; // 버튼 색상도 어둡게 변경
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
