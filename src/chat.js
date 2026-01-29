/**
 * Chat & Presence Logic using Firebase Realtime Database
 */

(function () {
    // Wait for Firebase libraries to load
    const initChat = () => {
        if (!window.firebase || !window.firebase.app || !window.firebase.database || !window.firebaseConfig) {
            console.warn("Firebase not loaded or configured correctly. Chat disabled.");
            return;
        }

        // Check if config is still default
        if (window.firebaseConfig.apiKey === "YOUR_API_KEY") {
            console.warn("Firebase config is default. Update src/chat-config.js.");
            renderPlaceholderUI(); // Show UI but with warning
            return;
        }

        try {
            // Initialize Firebase
            if (!firebase.apps.length) {
                firebase.initializeApp(window.firebaseConfig);
            }

            const db = firebase.database();
            const auth = firebase.auth();

            // Create UI
            createChatUI();

            // Anonymous Auth
            auth.signInAnonymously().catch((error) => {
                console.error("Auth Error:", error);
            });

            auth.onAuthStateChanged((user) => {
                if (user) {
                    // User is signed in.
                    setupPresence(user.uid, db);
                    setupChat(db, user.uid);
                }
            });

        } catch (e) {
            console.error("Chat initialization error:", e);
        }
    };

    const renderPlaceholderUI = () => {
        const app = document.getElementById('app');
        const chatWidget = document.createElement('div');
        chatWidget.id = 'chat-widget';
        chatWidget.innerHTML = `
            <button id="chat-toggle" title="Chat Unavailable">
                <i class="fa-solid fa-triangle-exclamation"></i>
            </button>
         `;
        app.appendChild(chatWidget);

        chatWidget.querySelector('button').onclick = () => {
            alert('Chat is currently disabled. Please configure Firebase credentials in src/chat-config.js');
        };
    };

    const createChatUI = () => {
        const app = document.getElementById('app');
        if (document.getElementById('chat-widget')) return;

        const widget = document.createElement('div');
        widget.id = 'chat-widget';

        widget.innerHTML = `
            <button id="chat-toggle">
                <i class="fa-solid fa-comments"></i>
                <div id="online-count-badge">0</div>
            </button>
            <div id="chat-window">
                <div class="chat-header">
                    <span id="header-status">Live Chat</span>
                    <button class="close-chat"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="chat-messages" id="chat-messages">
                    <div class="message system">Welcome to global chat!</div>
                </div>
                <div class="chat-input-area">
                    <input type="text" id="chat-input" placeholder="Type a message..." maxlength="140">
                    <button id="send-btn"><i class="fa-solid fa-paper-plane"></i></button>
                </div>
            </div>
        `;

        app.appendChild(widget);

        // Event Listeners
        const toggleBtn = widget.querySelector('#chat-toggle');
        const chatWindow = widget.querySelector('#chat-window');
        const closeBtn = widget.querySelector('.close-chat');
        const input = widget.querySelector('#chat-input');
        const sendBtn = widget.querySelector('#send-btn');

        const toggleChat = () => {
            chatWindow.classList.toggle('open');
            if (chatWindow.classList.contains('open')) {
                input.focus();
                scrollToBottom();
            }
        };

        toggleBtn.addEventListener('click', toggleChat);
        closeBtn.addEventListener('click', () => chatWindow.classList.remove('open'));

        // Expose send function to be attached later
        widget.sendMessage = null;

        const handleSend = () => {
            const text = input.value.trim();
            if (text && widget.sendMessage) {
                widget.sendMessage(text);
                input.value = '';
                input.focus();
            }
        };

        sendBtn.addEventListener('click', handleSend);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSend();
        });
    };

    const setupPresence = (uid, db) => {
        const userStatusDatabaseRef = db.ref('/status/' + uid);
        const allStatusRef = db.ref('/status');
        const connectedRef = db.ref('.info/connected');

        connectedRef.on('value', (snap) => {
            if (snap.val() === true) {
                // We're connected (or reconnected)!

                // When I disconnect, remove this device
                userStatusDatabaseRef.onDisconnect().remove().then(() => {
                    // Add this device to my connections list
                    // this value could contain info about the user!
                    userStatusDatabaseRef.set({
                        state: 'online',
                        last_changed: firebase.database.ServerValue.TIMESTAMP
                    });
                });
            }
        });

        // Monitor online count
        allStatusRef.on('value', (snapshot) => {
            const count = snapshot.numChildren();
            const badge = document.querySelector('#online-count-badge');
            const header = document.querySelector('#header-status');

            if (badge) badge.innerText = count;
            if (header) header.innerText = `Live Chat (${count} online)`;
        });
    };

    const setupChat = (db, uid) => {
        const messagesRef = db.ref('messages');
        const widget = document.getElementById('chat-widget');
        const messagesContainer = document.getElementById('chat-messages');

        // Limit to last 50 messages
        const recentMessagesQuery = messagesRef.limitToLast(50);

        // Attach send function
        widget.sendMessage = (text) => {
            messagesRef.push({
                text: text,
                sender: uid,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });
        };

        recentMessagesQuery.on('child_added', (snapshot) => {
            const msg = snapshot.val();
            const div = document.createElement('div');
            const isMe = msg.sender === uid;

            div.className = `message ${isMe ? 'sent' : 'received'}`;
            div.innerHTML = `
                ${escapeHtml(msg.text)}
                <span class="message-meta">${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            `;

            messagesContainer.appendChild(div);
            scrollToBottom();
        });
    };

    const scrollToBottom = () => {
        const container = document.getElementById('chat-messages');
        if (container) container.scrollTop = container.scrollHeight;
    };

    const escapeHtml = (text) => {
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function (m) { return map[m]; });
    };

    // Load libraries if not present, then init
    // Ideally these are in head, but if we want to be safe:
    if (typeof firebase === 'undefined') {
        // Wait a bit or assume they are loading from head
        window.addEventListener('load', initChat);
    } else {
        initChat();
    }

})();
