// Firebase Configuration
// REPLACE these values with your project's configuration
const firebaseConfig = {
    apiKey: "AIzaSyA8qtp4N2w5riknPmTEdMq4JQx_Rd-Hl3A",
    authDomain: "imagetoolscityetech.firebaseapp.com",
    databaseURL: "https://imagetoolscityetech-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "imagetoolscityetech",
    storageBucket: "imagetoolscityetech.firebasestorage.app",
    messagingSenderId: "339529239736",
    appId: "1:339529239736:web:bc59c40cdbdd171f97b84d"
};

// Export config globally or use strict mode if using modules, 
// but for this simple static setup, we'll keep it as a global var 
// that chat.js can read.
window.firebaseConfig = firebaseConfig;
