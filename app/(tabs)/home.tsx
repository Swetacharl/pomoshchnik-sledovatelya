// app/(tabs)/home.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../src/config/firebase';
  import { KeyboardAvoidingView, Platform } from 'react-native';
  
  // Внутри компонента:
  <KeyboardAvoidingView 
    style={{ flex: 1 }} 
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  >
     <ScrollView> ... </ScrollView>
  </KeyboardAvoidingView>

export default function HomeScreen() {
  const [userRole, setUserRole] = useState(null); // 'investigator' или 'expert'
  const [loading, setLoading] = useState(true);

  // 1. При загрузке экрана узнаем роль пользователя из базы данных
  useEffect(() => {
    const fetchUserRole = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || 'investigator');
          } else {
            setUserRole('investigator'); // Запасной вариант, если роли нет
          }
        } catch (error) {
          console.error('Ошибка получения роли:', error);
          setUserRole('investigator');
        }
      }
      setLoading(false);
    };
    fetchUserRole();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace('/(auth)/login');
  };

  // 2. Пока загружаем роль, показываем индикатор
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2980b9" />
        <Text style={styles.loadingText}>Загрузка профиля...</Text>
        </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔍 Помощник Следователя</Text>
        <Text style={styles.subtitle}>
          {userRole === 'expert' ? 'Кабинет судебного эксперта' : 'Кабинет следователя'}
        </Text>
      </View>

      <View style={styles.menu}>
        {/* === МЕНЮ ДЛЯ СЛЕДОВАТЕЛЯ === */}
        {userRole === 'investigator' && (
          <>
            <TouchableOpacity style={styles.card} onPress={() => router.push('/protocol/new')}>
              <Text style={styles.cardIcon}>📋</Text>
              <Text style={styles.cardText}>Новый осмотр</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => router.push('/(tabs)/archive')}>
              <Text style={styles.cardIcon}>📁</Text>
              <Text style={styles.cardText}>Архив протоколов</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => router.push('/(tabs)/codes')}>
              <Text style={styles.cardIcon}>📖</Text>
              <Text style={styles.cardText}>Справочник кодексов</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => router.push('/investigator/expert-answers')}>
              <Text style={styles.cardIcon}>📨</Text>
              <Text style={styles.cardText}>Ответы экспертов</Text>
            </TouchableOpacity>
          </>
        )}

        {/* === МЕНЮ ДЛЯ ЭКСПЕРТА (Пункт 5 выполнен) === */}
        {userRole === 'expert' && (
          <>
            <TouchableOpacity style={styles.card} onPress={() => router.push('/expert/dashboard')}>
              <Text style={styles.cardIcon}>📂</Text>
              <Text style={styles.cardText}>Мои дела (Протоколы)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => router.push('/expert/reference')}>
              <Text style={styles.cardIcon}>📚</Text>
              <Text style={styles.cardText}>Справочник эксперта</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Выйти из системы</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#7f8c8d', fontSize: 14 },
  header: { padding: 20, backgroundColor: '#2c3e50', alignItems: 'center' },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: '#bdc3c7', fontSize: 14, marginTop: 5 },
  menu: { padding: 15, flex: 1 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 12, elevation: 2 },
  cardIcon: { fontSize: 32, marginRight: 15 },
  cardText: { fontSize: 18, fontWeight: '600', color: '#2c3e50' },
  logoutButton: { margin: 20, padding: 15, backgroundColor: '#e74c3c', borderRadius: 10, alignItems: 'center' },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
