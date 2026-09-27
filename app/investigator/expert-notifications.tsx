// app/investigator/expert-notifications.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../src/config/firebase';

export default function ExpertNotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Загружаем уведомления о готовых экспертизах
    const q = query(
      collection(db, 'expertReports'),
      where('requesterId', '==', auth.currentUser?.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Сортируем по дате (новые сверху)
      docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setNotifications(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => Alert.alert('Заключение эксперта', `Дело: ${item.caseNumber}\nВывод: ${item.conclusion}`)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.caseNumber}>Дело № {item.caseNumber}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
      <Text style={styles.expertName}>👤 Эксперт: {item.expert}</Text>
      <Text style={styles.conclusion} numberOfLines={3}>📝 {item.conclusion}</Text>
      <Text style={styles.status}>✅ Экспертиза завершена</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Загрузка уведомлений...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}> Назад</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Уведомления об экспертизах</Text>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.icon}>📭</Text>
          <Text style={styles.emptyText}>Нет уведомлений</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#7f8c8d' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  backBtn: { fontSize: 16, color: '#2980b9', fontWeight: 'bold', marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  list: { padding: 15 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 12, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#27ae60' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  caseNumber: { fontSize: 16, fontWeight: 'bold', color: '#2980b9' },
  date: { fontSize: 13, color: '#7f8c8d' },
  expertName: { fontSize: 14, color: '#34495e', marginBottom: 6 },
  conclusion: { fontSize: 13, color: '#2c3e50', marginBottom: 8 },
  status: { fontSize: 12, color: '#27ae60', fontWeight: '600' },
  icon: { fontSize: 48, marginBottom: 10 },
  emptyText: { fontSize: 15, color: '#7f8c8d' }
});
