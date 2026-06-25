// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBw-oIUIU327OsJIVgtWCxjv-ibAJT4wqM",
  authDomain: "forensichelper.firebaseapp.com",
  databaseURL: "https://forensichelper-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "forensichelper",
  storageBucket: "forensichelper.firebasestorage.app",
  messagingSenderId: "875206695758",
  appId: "1:875206695758:web:dc688de6e0bab2869adc1f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// ✅ ИСПРАВЛЕНИЕ: Настройка persistence для сохранения сессии
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);

export { auth, db };
