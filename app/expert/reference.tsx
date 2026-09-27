// app/expert/reference.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { router } from 'expo-router';

export default function ExpertReferenceScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 1, icon: '', title: 'Методы исследования', description: 'Дактилоскопия, ДНК, баллистика' },
    { id: 2, icon: '📊', title: 'Нормативные документы', description: 'ФЗ, приказы, инструкции' },
    { id: 3, icon: '🧪', title: 'Реактивы и материалы', description: 'Люминол, нингидрин, порошки' },
    { id: 4, icon: '', title: 'Шаблоны заключений', description: 'Формы и образцы' },
    { id: 5, icon: '⚖️', title: 'Судебная практика', description: 'Примеры из практики' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>⬅ Назад</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Справочник эксперта</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="🔍 Поиск..."
        placeholderTextColor="#4a5568"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <ScrollView style={styles.content}>
        {categories.map(cat => (
          <TouchableOpacity key={cat.id} style={styles.card}>
            <Text style={styles.icon}>{cat.icon}</Text>
            <View style={styles.cardContent}>
              <Text style={styles.title}>{cat.title}</Text>
              <Text style={styles.description}>{cat.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  backBtn: { fontSize: 16, color: '#2980b9', fontWeight: 'bold', marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  searchInput: { backgroundColor: '#fff', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#bdc3c7', margin: 15, fontSize: 15 },
  content: { flex: 1, padding: 15 },
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 12, elevation: 2 },
  icon: { fontSize: 32, marginRight: 15 },
  cardContent: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 4 },
  description: { fontSize: 13, color: '#7f8c8d' }
});
