// app/archive/view.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../src/config/firebase';
import { exportProtocolToWord } from '../../src/exportProtocol';

export default function ViewProtocolScreen() {
  const { protocolId } = useLocalSearchParams();
  const [protocol, setProtocol] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadProtocol();
  }, [protocolId]);

  const loadProtocol = async () => {
    try {
      const docRef = doc(db, 'protocols', protocolId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProtocol({ id: docSnap.id, ...docSnap.data() });
      } else {
        Alert.alert('Ошибка', 'Протокол не найден');
        router.back();
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить протокол: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!protocol) return;
    setExporting(true);
    try {
      await exportProtocolToWord(protocol, [], []);
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось экспортировать: ' + e.message);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2980b9" />
        <Text style={styles.loadingText}>Загрузка протокола...</Text>
      </View>
    );
  }

  if (!protocol) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>⬅ Назад</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Просмотр протокола</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📞 Общие сведения</Text>
          <Text style={styles.label}>Номер: {protocol.protocolNumber}</Text>
          <Text style={styles.label}>Дата: {protocol.dateTime}</Text>
          <Text style={styles.label}>Адрес: {protocol.address}</Text>
          <Text style={styles.label}>Причина: {protocol.reasonForCall}</Text>
          <Text style={styles.label}>Заявитель: {protocol.callerName || '—'}</Text>
        </View>

        {protocol.witnessesList && protocol.witnessesList.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👥 Понятые</Text>
            {protocol.witnessesList.map((w, i) => (
              <Text key={i} style={styles.text}>{i + 1}. {w.fio} ({w.address})</Text>
            ))}
          </View>
        )}

        {protocol.eyewitnessesList && protocol.eyewitnessesList.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👁️ Очевидцы</Text>
            {protocol.eyewitnessesList.map((w, i) => (
              <Text key={i} style={styles.text}>{i + 1}. {w.fio} ({w.address})</Text>
            ))}
          </View>
        )}

        {protocol.specialistsList && protocol.specialistsList.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔧 Специалисты</Text>
            {protocol.specialistsList.map((s, i) => (
              <Text key={i} style={styles.text}>{i + 1}. {s.name} ({s.role})</Text>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔍 Следы</Text>
          <Text style={styles.text}>
            {protocol.checklist?.filter(c => c.checked).map(c => c.name).join(', ') || 'Не обнаружены'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Изъято</Text>
          <Text style={styles.text}>{protocol.seizedItems || '—'}</Text>
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={styles.exportBtn} 
        onPress={handleExport} 
        disabled={exporting}
      >
        {exporting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.exportText}>📤 Экспорт в Word</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 14, color: '#7f8c8d' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  backBtn: { fontSize: 16, color: '#2980b9', fontWeight: 'bold', marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  content: { flex: 1, padding: 15 },
  section: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 12, elevation: 1 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 10 },
  label: { fontSize: 14, color: '#7f8c8d', marginBottom: 4 },
  text: { fontSize: 14, color: '#2c3e50', marginBottom: 4 },
  exportBtn: { margin: 15, padding: 14, backgroundColor: '#2980b9', borderRadius: 10, alignItems: 'center' },
  exportText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
