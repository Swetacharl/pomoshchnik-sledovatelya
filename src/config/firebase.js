// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBw-oIUIU327OsJIVgtWCxjv-ibAJT4wqM",
  authDomain: "forensichelper.firebaseapp.com",
  databaseURL: "https://forensichelper-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "forensichelper",
  storageBucket: "forensichelper.firebasestorage.app",
  messagingSenderId: "875206695758",
  appId: "1:875206695758:web:dc688de6e0bab2869adc1f"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// ✅ Сохранение сессии (чтобы не входить каждый раз)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// База данных Firestore
const db = getFirestore(app);

export { auth, db };
