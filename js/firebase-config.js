// ============================================================
// firebase-config.js — Firebase 초기화
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyAECDv7wFAC2EjrH3lao2VYyqnEECL3640",
    authDomain: "deal-manager-f88a9.firebaseapp.com",
    projectId: "deal-manager-f88a9",
    storageBucket: "deal-manager-f88a9.firebasestorage.app",
    messagingSenderId: "869597067401",
    appId: "1:869597067401:web:dc954b06005ccfc168ae58"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
