// app/(auth)/register.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../src/config/firebase';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Для основного пароля
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Для повторного пароля
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // 1. Валидация полей
    if (!fullName || !email || !password) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Ошибка', 'Пароли не совпадают');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Ошибка', 'Пароль должен содержать минимум 6 символов');
      return;
    }
    
    setLoading(true);
    try {
      // 2. Создаём пользователя в Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // 3. Сохраняем профиль в Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        fullName: fullName,
        createdAt: new Date().toISOString()
      });
      
      // ✅ 4. Успех: принудительно переходим на главное меню
      Alert.alert('Успех', 'Аккаунт создан!', [
        { 
          text: 'OK', 
          onPress: () => {
            router.replace('/(tabs)/home');
          } 
        }
      ]);
      
    } catch (error) {
      let msg = 'Ошибка регистрации';
      if (error.code === 'auth/email-already-in-use') msg = 'Этот email уже занят';
      if (error.code === 'auth/invalid-email') msg = 'Некорректный формат email';
      if (error.code === 'auth/weak-password') msg = 'Пароль слишком слабый';
      if (error.code === 'auth/network-request-failed') msg = 'Нет соединения с интернетом';
      
      Alert.alert('Ошибка', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 Регистрация</Text>
      
      <TextInput 
        style={styles.input} 
        placeholder="Введите ваше ФИО" 
        placeholderTextColor="#95a5a6"
        color="#2c3e50" // <-- ЯВНЫЙ ЦВЕТ ТЕКСТА
        value={fullName} 
        onChangeText={setFullName} 
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Введите ваш email" 
        placeholderTextColor="#95a5a6"
        color="#2c3e50" // <-- ЯВНЫЙ ЦВЕТ ТЕКСТА
        value={email} 
        onChangeText={setEmail} 
        autoCapitalize="none" 
        keyboardType="email-address" 
      />
      
      {/* ПОЛЕ ПАРОЛЯ С КНОПКОЙ "ГЛАЗ" */}
      <View style={styles.passwordContainer}>
        <TextInput 
          style={styles.input} 
          placeholder="Введите пароль (мин. 6 символов)" 
          placeholderTextColor="#95a5a6"
          color="#2c3e50" // <-- ЯВНЫЙ ЦВЕТ ТЕКСТА
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry={!showPassword} 
        />
        <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#4a5568" />
        </TouchableOpacity>
      </View>
      
      {/* ПОЛЕ ПОВТОРА ПАРОЛЯ С КНОПКОЙ "ГЛАЗ" */}
      <View style={styles.passwordContainer}>
        <TextInput 
          style={styles.input} 
          placeholder="Повторите пароль" 
          placeholderTextColor="#95a5a6"
          color="#2c3e50" // <-- ЯВНЫЙ ЦВЕТ ТЕКСТА
          value={confirmPassword} 
          onChangeText={setConfirmPassword} 
          secureTextEntry={!showConfirmPassword} 
        />
        <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={24} color="#4a5568" />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Зарегистрироваться</Text>}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
        <Text style={styles.link}>Уже есть аккаунт? Войти</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f0f4f8' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50', textAlign: 'center', marginBottom: 20 },
  input: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: '#bdc3c7', 
    fontSize: 16,
    color: '#2c3e50' // <-- ГАРАНТИРУЕМ, ЧТО ВВЕДЕННЫЙ ТЕКСТ ВСЕГДА БУДЕТ ТЕМНЫМ И ВИДНЫМ
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
    padding: 5,
  },
  button: { backgroundColor: '#27ae60', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  link: { color: '#3498db', textAlign: 'center', marginTop: 20, fontSize: 14 }
});
