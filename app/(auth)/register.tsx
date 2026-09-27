// app/(auth)/register.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../src/config/firebase';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  
  // ✅ 1. ДОБАВЛЕНО: Состояние для выбора роли (по умолчанию следователь)
  const [role, setRole] = useState('investigator'); 
  
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // ✅ 2. ИЗМЕНЕНО: Добавлено поле role при сохранении в Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        fullName: fullName,
        role: role, // <-- Сохраняем выбранную роль
        createdAt: serverTimestamp()
      });
      
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
        color="#2c3e50"
        value={fullName} 
        onChangeText={setFullName} 
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Введите ваш email" 
        placeholderTextColor="#95a5a6"
        color="#2c3e50"
        value={email} 
        onChangeText={setEmail} 
        autoCapitalize="none" 
        keyboardType="email-address" 
      />
      
      <View style={styles.passwordContainer}>
        <TextInput 
          style={styles.input} 
          placeholder="Введите пароль (мин. 6 символов)" 
          placeholderTextColor="#95a5a6"
          color="#2c3e50"
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry={!showPassword} 
        />
        <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#4a5568" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.passwordContainer}>
        <TextInput 
          style={styles.input} 
          placeholder="Повторите пароль" 
          placeholderTextColor="#95a5a6"
          color="#2c3e50"
          value={confirmPassword} 
          onChangeText={setConfirmPassword} 
          secureTextEntry={!showConfirmPassword} 
        />
        <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={24} color="#4a5568" />
        </TouchableOpacity>
      </View>

      {/* ✅ 3. ДОБАВЛЕНО: Блок выбора должности */}
      <View style={styles.roleContainer}>
        <Text style={styles.roleLabel}>Выберите вашу должность:</Text>
        <View style={styles.roleButtons}>
          <TouchableOpacity 
            style={[styles.roleBtn, role === 'investigator' && styles.roleBtnActive]} 
            onPress={() => setRole('investigator')}
          >
            <Text style={[styles.roleText, role === 'investigator' && styles.roleTextActive]}>👮 Следователь</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.roleBtn, role === 'expert' && styles.roleBtnActive]} 
            onPress={() => setRole('expert')}
          >
            <Text style={[styles.roleText, role === 'expert' && styles.roleTextActive]}>🔬 Эксперт</Text>
          </TouchableOpacity>
        </View>
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
    color: '#2c3e50'
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
  // ✅ 4. ДОБАВЛЕНО: Стили для блока выбора роли
  roleContainer: { marginBottom: 20 },
  roleLabel: { fontSize: 14, color: '#7f8c8d', marginBottom: 8, fontWeight: '600' },
  roleButtons: { flexDirection: 'row', gap: 10 },
  roleBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#bdc3c7', alignItems: 'center', backgroundColor: '#fff' },
  roleBtnActive: { backgroundColor: '#2980b9', borderColor: '#2980b9' },
  roleText: { fontSize: 14, color: '#7f8c8d', fontWeight: '600' },
  roleTextActive: { color: '#fff' },
  
  button: { backgroundColor: '#27ae60', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  link: { color: '#3498db', textAlign: 'center', marginTop: 20, fontSize: 14 }
});
