// app/investigator/ask-expert.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet, FlatList } from 'react-native';
import { router } from 'expo-router';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../src/config/firebase';

export default function AskExpertScreen() {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [questions, setQuestions] = useState([{ id: 1, text: '' }]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Загружаем дела следователя
    const q = query(
      collection(db, 'protocols'),
      where('authorId', '==', auth.currentUser?.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCases(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addQuestion = () => {
    setQuestions([...questions, { id: Date.now(), text: '' }]);
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id, text) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, text } : q));
  };

  const handleSubmit = async () => {
    if (!selectedCase) {
      return Alert.alert('Ошибка', 'Выберите номер дела');
    }
    if (questions.every(q => !q.text.trim())) {
      return Alert.alert('Ошибка', 'Добавьте хотя бы один вопрос');
    }

    try {
      await addDoc(collection(db, 'expertRequests'), {
        protocolId: selectedCase.id,
        protocolNumber: selectedCase.protocolNumber,
        questions: questions.filter(q => q.text.trim()),
        authorId: auth.currentUser?.uid,
        authorName: auth.currentUser?.email,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      Alert.alert('✅ Успех', 'Вопросы отправлены эксперту!');
      router.back();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось отправить вопросы: ' + error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Загрузка дел...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}> Назад</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Задать вопрос эксперту</Text>
      </View>

      <ScrollView style={styles.form}>
        {/* Выбор дела */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Выберите дело</Text>
          {cases.map(c => (
            <TouchableOpacity
              key={c.id}
              style={[styles.caseBtn, selectedCase?.id === c.id && styles.caseBtnActive]}
              onPress={() => setSelectedCase(c)}
            >
              <Text style={styles.caseNumber}>{c.protocolNumber}</Text>
              <Text style={styles.caseDate}>{c.dateTime}</Text>
            </TouchableOpacity>
          ))}
          {cases.length === 0 && (
            <Text style={styles.emptyText}>У вас нет созданных дел</Text>
          )}
        </View>

        {/* Вопросы */}
        {selectedCase && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}> Вопросы к эксперту</Text>
            {questions.map((q, index) => (
              <View key={q.id} style={styles.questionRow}>
                <Text style={styles.questionNumber}>{index + 1}.</Text>
                <TextInput
                  style={styles.questionInput}
                  placeholder={`Вопрос №${index + 1}...`}
                  placeholderTextColor="#4a5568"
                  value={q.text}
                  onChangeText={(text) => updateQuestion(q.id, text)}
                  multiline
                />
                {questions.length > 1 && (
                  <TouchableOpacity onPress={() => removeQuestion(q.id)}>
                    <Text style={styles.removeBtn}>❌</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity style={styles.addBtn} onPress={addQuestion}>
              <Text style={styles.addText}>+ Добавить вопрос</Text>
            </TouchableOpacity>
          </View>
        )}

        {selectedCase && (
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitText}>📤 Отправить вопросы</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
  form: { flex: 1, padding: 15 },
  section: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 10 },
  caseBtn: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#bdc3c7', marginBottom: 8, backgroundColor: '#f8f9fa' },
  caseBtnActive: { backgroundColor: '#e8f5e9', borderColor: '#27ae60' },
  caseNumber: { fontSize: 14, fontWeight: 'bold', color: '#2980b9' },
  caseDate: { fontSize: 12, color: '#7f8c8d', marginTop: 4 },
  emptyText: { fontSize: 14, color: '#7f8c8d', textAlign: 'center', marginTop: 10 },
  questionRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  questionNumber: { fontSize: 14, color: '#2c3e50', fontWeight: 'bold', marginTop: 12, marginRight: 8 },
  questionInput: { flex: 1, backgroundColor: '#f8f9fa', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', fontSize: 14, color: '#2c3e50', minHeight: 60 },
  removeBtn: { fontSize: 20, marginLeft: 8, marginTop: 10 },
  addBtn: { marginTop: 10, padding: 10, backgroundColor: '#ecf0f1', borderRadius: 6, alignItems: 'center' },
  addText: { color: '#2c3e50', fontWeight: 'bold', fontSize: 13 },
  submitBtn: { backgroundColor: '#2980b9', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
