// app/(tabs)/archive.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../src/config/firebase';

export default function ArchiveScreen() {
  const [protocols, setProtocols] = useState([]);
  const [filteredProtocols, setFilteredProtocols] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Загрузка протоколов в реальном времени
  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'protocols'),
      where('authorId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setProtocols(docs);
      setFilteredProtocols(docs);
      setLoading(false);
    }, (error) => {
      console.error('Ошибка загрузки архива:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Фильтрация по поисковому запросу
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProtocols(protocols);
    } else {
      const filtered = protocols.filter(p =>
        p.protocolNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProtocols(filtered);
    }
  }, [searchQuery, protocols]);

  // 3. Отображение карточки протокола
  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => router.push(`/archive/view?protocolId=${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.number}>{item.protocolNumber}</Text>
        <Text style={styles.date}>{item.dateTime}</Text>
      </View>
      <Text style={styles.address} numberOfLines={2}>{item.address}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.traces}>
          Следы: {item.checklist?.filter(c => c.checked).length || 0}
        </Text>
        <Text style={styles.viewHint}>👆 Нажмите для просмотра</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2980b9" />
        <Text style={styles.loadingText}>Загрузка архива...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📁 Архив протоколов</Text>
      
      <TextInput
        style={styles.searchInput}
        placeholder="🔍 Поиск по номеру (ОСМ-...)"
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoCapitalize="none"
      />

      {filteredProtocols.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.icon}>📂</Text>
          <Text style={styles.emptyText}>
            {searchQuery ? 'Ничего не найдено' : 'Архив пуст. Создайте первый осмотр.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProtocols}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8', padding: 15 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50', marginBottom: 15, textAlign: 'center' },
  searchInput: { backgroundColor: '#fff', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#bdc3c7', marginBottom: 15, fontSize: 15 },
  list: { paddingBottom: 20 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 12, elevation: 2, borderWidth: 1, borderColor: '#e0e0e0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  number: { fontSize: 16, fontWeight: 'bold', color: '#2980b9' },
  date: { fontSize: 13, color: '#7f8c8d' },
  address: { fontSize: 14, color: '#34495e', marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  traces: { fontSize: 13, color: '#27ae60', fontWeight: '600' },
  viewHint: { fontSize: 12, color: '#95a5a6', fontStyle: 'italic' },
  loadingText: { marginTop: 10, color: '#7f8c8d', fontSize: 14 },
  icon: { fontSize: 48, marginBottom: 10 },
  emptyText: { fontSize: 15, color: '#7f8c8d', textAlign: 'center', maxWidth: 250 }
});
