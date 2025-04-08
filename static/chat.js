//let http_url="http://127.0.0.1:8080"
//let ws_url="ws://127.0.0.1:8080"
let http_url="https://rust-chat-um86.onrender.com"
let ws_url="wss://rust-chat-um86.onrender.com"


let socket
const statusElement = document.getElementById("connection-status");
let username


//CHAT
fetch(`${http_url}/auth-check`, {
    credentials: "include"
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "ok") {
    username = data.username;
    ConnectSocket()
    } else {
    window.location.href = "./auth.html";
    }
  });


//CHAT

function ToggleStatus(status){
    if(status==1){
    statusElement.textContent = "Connected!";
    statusElement.style.color="#b8bb26";
    }
    else if(status==0){
        statusElement.textContent = "Connecting...";
        statusElement.style.color="#83a598";
    }
    else if(status==-1){
        statusElement.textContent = "Disconnected...(Refresh)";
        statusElement.style.color="#fb4934";
    }
}

function ConnectSocket() {
    ToggleStatus(0);
    socket = new WebSocket(`${ws_url}/chat`);
    socket.onopen = () => {
        ToggleStatus(1);
        let messagesDiv = document.getElementById("ChatBox");
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    };
    socket.onclose = () => {
        ToggleStatus(-1);
    };
    
    socket.onmessage = (event) =>{ console.log("Message received:", event.data);
    displayMessage(event.data);
    }
}


function sendMessage(event) {
    event.preventDefault();
    const MessageBox = document.getElementById("ClientMessage");
    const msg = MessageBox.value.trim()
    if (msg) {
         {
        const payload = msg_type==="broadcast" ? {type: msg_type,msg: msg} : {type: msg_type,to:dm_recipient,msg: msg}
        socket.send(JSON.stringify(payload));
        //displayMessage(JSON.stringify([username, msg]));
        MessageBox.value = "";
    
    }}
}

let msg_type = "broadcast", dm_recipient;

document.getElementById("ChatBox").addEventListener("click", (event) => {
    if (event.target.tagName === "BUTTON") {
        let button_text = event.target.textContent.trim();        
        if (button_text.includes("::")) {
            button_text = button_text.split("::").pop().trim();
        }
        const messageBox = document.getElementById("MessageBox");
        const existingInfo = document.querySelector("#MessageBox h4");
        if (existingInfo) existingInfo.remove();

        if (button_text !== dm_recipient) {
            msg_type = "dm"; 
            dm_recipient = button_text;
            const info = document.createElement("h4");
            info.textContent = `Whisper -> ${dm_recipient}`;
            messageBox.prepend(info); 
        } else {
            msg_type = "broadcast"; 
            dm_recipient = null;
        }
        document.getElementById("ClientMessage").focus();
    }
});
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        msg_type = "broadcast";
        dm_recipient = null;
        const existingInfo = document.querySelector("#MessageBox h4");
        if (existingInfo) {
            existingInfo.remove();
        }
        document.getElementById("ClientMessage").focus();

    }
});

lastUser=""
function displayMessage(text) {
    let user, message, messageContainer;
    try {
        [user, message] = JSON.parse(text);
    } catch {
        message = text;
    }

    let messagesDiv = document.getElementById("ChatBox");
    messageContainer = document.createElement("div");
    const nearBottom = messagesDiv.scrollHeight - messagesDiv.scrollTop <= messagesDiv.clientHeight + 40;

    if (user != lastUser) {
        const messageUser = document.createElement("button");
        messageUser.textContent = user;
        messageContainer.appendChild(messageUser);
        lastUser = user;
    }

    const messageContent = document.createElement("p");

    // Convert newlines to <br> and escape HTML
    messageContent.innerHTML = message
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>");

    messageContainer.appendChild(messageContent);
    messagesDiv.appendChild(messageContainer);

    messageContainer.classList.add(
        user === "SERVER" ? "ServerMessage" : (user === username ? "SelfMessage" : "OtherMessage")
    );

    if (user === username || nearBottom) {
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
}
