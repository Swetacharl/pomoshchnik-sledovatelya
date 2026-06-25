// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBkX5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5",
  authDomain: "pomoshniksledovatelya.firebaseapp.com",
  projectId: "pomoshniksledovatelya",
  storageBucket: "pomoshniksledovatelya.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// ✅ ИСПРАВЛЕНИЕ: Настройка persistence для сохранения сессии
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);

export { auth, db };
