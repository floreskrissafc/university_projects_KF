// To show the users the chats written by them in this ChatRoom
// this script is used in room.html

const roomName = JSON.parse(document.getElementById('room-name').textContent);
const chatLog = document.querySelector('#chat-log');

// To show some text if there are no messages between the two users
if (chatLog.childNodes.length <= 1 ) {
    const emptyText = document.createElement('h3');
    emptyText.id = 'emptyText';
    emptyText.innerText = 'No messages yet in this chat';
    chatLog.appendChild(emptyText);
}

// creating the WebSocket to allow asynchronous messaging 
const chatSocket = new WebSocket(
    'ws://'
    + window.location.host
    + '/ws/message/'
    + roomName
    + '/'
);

chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    const messageElement = document.createElement('div');
    const userId = data['user_id'];
    const loggedInUserId = JSON.parse(document.getElementById('user_id').textContent);
    messageElement.innerText = data.message;
    // To add different classes to sender and receiver so that
    // they are shown with different colors and differnt positions in the chat room
    if ( userId == loggedInUserId ){
        messageElement.classList.add('message', 'sender')
    } else {
        messageElement.classList.add('message', 'receiver')
    }
    // To actually add the new message to the chat
    chatLog.appendChild(messageElement);
    if ( document.querySelector('#emptyText')){
        // Remove the default text when there are messages to show
        document.querySelector('#emptyText').remove()
    }
};

chatSocket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
};

document.querySelector('#chat-message-input').focus();

// What to do when the user clicks the Enter button
document.querySelector('#chat-message-input').onkeyup = function(e) {
    if (e.keyCode === 13) {  // enter, return
        document.querySelector('#chat-message-submit').click();
    }
};

// Submit the message when the submit button is pressed
document.querySelector('#chat-message-submit').onclick = function(e) {
    const messageInputDom = document.querySelector('#chat-message-input');
    const message = messageInputDom.value;
    chatSocket.send(JSON.stringify({
        'message': message
    }));
    messageInputDom.value = '';
};