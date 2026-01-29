/**
 * Chat & Presence Logic using Firebase Realtime Database
 * Enhanced with user identification and read receipts
 */

(function () {
    const COLORS = [
        '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
        '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
    ];

    const ADJECTIVES = ['Happy', 'Cool', 'Swift', 'Bright', 'Wise', 'Bold', 'Quick', 'Calm', 'Brave', 'Smart'];
    const NOUNS = ['Fox', 'Eagle', 'Tiger', 'Dolphin', 'Panda', 'Wolf', 'Hawk', 'Lion', 'Bear', 'Owl'];

    // Get or create user profile
    const getUserProfile = () => {
        let profile = localStorage.getItem('chatUserProfile');
        if (profile) {
            return JSON.parse(profile);
        }

        // Generate new profile
        const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
        const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];

        profile = {
            username: `${adjective}${noun}`,
            color: color
        };

        localStorage.setItem('chatUserProfile', JSON.stringify(profile));
        return profile;
    };

    // Wait for Firebase libraries to load
    const initChat = () => {
        if (!window.firebase || !window.firebase.app || !window.firebase.database || !window.firebaseConfig) {
            console.warn("Firebase not loaded or configured correctly. Chat disabled.");
            return;
        }

        // Check if config is still default
        if (window.firebaseConfig.apiKey === "YOUR_API_KEY") {
            console.warn("Firebase config is default. Update src/chat-config.js.");
            renderPlaceholderUI();
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
                    const profile = getUserProfile();
                    setupPresence(user.uid, db, profile);
                    setupChat(db, user.uid, profile);
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

    const setupPresence = (uid, db, profile) => {
        const userStatusDatabaseRef = db.ref('/status/' + uid);
        const allStatusRef = db.ref('/status');
        const connectedRef = db.ref('.info/connected');
        const userProfileRef = db.ref('/users/' + uid);

        // Store user profile
        userProfileRef.set({
            username: profile.username,
            color: profile.color,
            lastSeen: firebase.database.ServerValue.TIMESTAMP
        });

        connectedRef.on('value', (snap) => {
            if (snap.val() === true) {
                userStatusDatabaseRef.onDisconnect().remove().then(() => {
                    userStatusDatabaseRef.set({
                        state: 'online',
                        username: profile.username,
                        color: profile.color,
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

    const setupChat = (db, uid, profile) => {
        const messagesRef = db.ref('messages');
        const widget = document.getElementById('chat-widget');
        const messagesContainer = document.getElementById('chat-messages');
        const messageElements = new Map(); // Track message DOM elements

        // Limit to last 50 messages
        const recentMessagesQuery = messagesRef.limitToLast(50);

        // Attach send function
        widget.sendMessage = (text) => {
            messagesRef.push({
                text: text,
                sender: uid,
                username: profile.username,
                color: profile.color,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                readBy: {}
            });
        };

        recentMessagesQuery.on('child_added', (snapshot) => {
            const msg = snapshot.val();
            const msgId = snapshot.key;
            const isMe = msg.sender === uid;

            const div = document.createElement('div');
            div.className = `message ${isMe ? 'sent' : 'received'}`;
            div.dataset.messageId = msgId;

            const usernameSpan = isMe ? '' : `<span class="message-username" style="color: ${msg.color}">${escapeHtml(msg.username)}</span>`;

            div.innerHTML = `
                ${usernameSpan}
                <div class="message-text">${escapeHtml(msg.text)}</div>
                <span class="message-meta">
                    ${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    <span class="read-receipt" data-msg-id="${msgId}"></span>
                </span>
            `;

            messagesContainer.appendChild(div);
            messageElements.set(msgId, div);
            scrollToBottom();

            // Mark as read
            if (!isMe) {
                markMessageAsRead(db, msgId, uid);
            }

            // Listen for read updates
            messagesRef.child(msgId).child('readBy').on('value', (readSnap) => {
                updateReadReceipt(msgId, readSnap.val(), isMe);
            });
        });

        // Mark visible messages as read when chat opens
        const chatWindow = document.getElementById('chat-window');
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' && chatWindow.classList.contains('open')) {
                    markVisibleMessagesAsRead(db, uid);
                }
            });
        });
        observer.observe(chatWindow, { attributes: true });
    };

    const markMessageAsRead = (db, msgId, uid) => {
        db.ref(`messages/${msgId}/readBy/${uid}`).set(true);
    };

    const markVisibleMessagesAsRead = (db, uid) => {
        const messages = document.querySelectorAll('.message.received');
        messages.forEach((msgEl) => {
            const msgId = msgEl.dataset.messageId;
            if (msgId) {
                markMessageAsRead(db, msgId, uid);
            }
        });
    };

    const updateReadReceipt = (msgId, readByData, isMe) => {
        const receiptEl = document.querySelector(`.read-receipt[data-msg-id="${msgId}"]`);
        if (!receiptEl) return;

        if (!readByData) {
            receiptEl.innerHTML = isMe ? '✓' : '';
            return;
        }

        const readCount = Object.keys(readByData).length;

        if (isMe) {
            if (readCount === 0) {
                receiptEl.innerHTML = '✓';
            } else if (readCount === 1) {
                receiptEl.innerHTML = '✓✓';
            } else {
                receiptEl.innerHTML = `👁️ ${readCount}`;
            }
        }
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
    if (typeof firebase === 'undefined') {
        window.addEventListener('load', initChat);
    } else {
        initChat();
    }

})();
