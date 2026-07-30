importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyAN2sBnV293_cFlFsk9W54xzhSaOftYxJ8",
  authDomain: "tradelink-ad9d4.firebaseapp.com",
  projectId: "tradelink-ad9d4",
  storageBucket: "tradelink-ad9d4.firebasestorage.app",
  messagingSenderId: "493389973064",
  appId: "1:493389973064:web:41df7fdcd83aa986217a7d",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
});
