// app/expert-report.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import * as FileSystem from 'expo-file-system/legacy';  // ← legacy импорт
import * as Sharing from 'expo-sharing';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../src/config/firebase';

export default function ExpertReportScreen() {
  const [reportData, setReportData] = useState({
    number: '',
    date: new Date().toLocaleDateString('ru-RU'),
    expert: '',
    expertQualification: '',
    caseNumber: '',
    question: '',
    objects: '',
    researchMethods: '',
    findings: '',
    conclusion: '',
  });

  const [questions, setQuestions] = useState([{ id: 1, text: '', answer: '' }]);

  const updateField = (field, value) => setReportData(prev => ({ ...prev, [field]: value }));

  const addQuestion = () => setQuestions([...questions, { id: Date.now(), text: '', answer: '' }]);
  const removeQuestion = (id) => setQuestions(questions.filter(q => q.id !== id));
  const updateQuestion = (id, field, text) => setQuestions(questions.map(q => q.id === id ? { ...q, [field]: text } : q));

  const handleSaveAndExport = async () => {
    if (!reportData.caseNumber.trim()) {
      return Alert.alert('Ошибка', 'Обязательно укажите номер уголовного дела!');
    }
    if (!reportData.expert.trim()) {
      return Alert.alert('Ошибка', 'Укажите ФИО эксперта!');
    }

    try {
      const children = [
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'ЗАКЛЮЧЕНИЕ ЭКСПЕРТА', bold: true, size: 32 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `№ ${reportData.number} от ${reportData.date}`, size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: ' ' })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `По уголовному делу № ${reportData.caseNumber}`, bold: true, size: 26 })] }),
        new Paragraph({ children: [new TextRun({ text: ' ' })] }),
        new Paragraph({ children: [new TextRun({ text: 'Эксперт: ', bold: true }), new TextRun({ text: reportData.expert })] }),
        new Paragraph({ children: [new TextRun({ text: 'Квалификация: ', bold: true }), new TextRun({ text: reportData.expertQualification })] }),
        new Paragraph({ children: [new TextRun({ text: ' ' })] }),
        new Paragraph({ children: [new TextRun({ text: 'Поставленные вопросы:', bold: true, underline: {} })] }),
      ];

      questions.forEach((q, i) => {
        if (q.text.trim()) {
          children.push(new Paragraph({ children: [new TextRun({ text: `${i + 1}. ${q.text}` })] }));
        }
      });

      children.push(
        new Paragraph({ children: [new TextRun({ text: ' ' })] }),
        new Paragraph({ children: [new TextRun({ text: 'Представленные объекты:', bold: true, underline: {} })] }),
        new Paragraph({ children: [new TextRun({ text: reportData.objects })] }),
        new Paragraph({ children: [new TextRun({ text: ' ' })] }),
        new Paragraph({ children: [new TextRun({ text: 'Методы исследования:', bold: true, underline: {} })] }),
        new Paragraph({ children: [new TextRun({ text: reportData.researchMethods })] }),
        new Paragraph({ children: [new TextRun({ text: ' ' })] }),
        new Paragraph({ children: [new TextRun({ text: 'Результаты исследования:', bold: true, underline: {} })] }),
        new Paragraph({ children: [new TextRun({ text: reportData.findings })] }),
        new Paragraph({ children: [new TextRun({ text: ' ' })] }),
        new Paragraph({ children: [new TextRun({ text: 'ВЫВОДЫ:', bold: true, underline: {}, size: 26 })] }),
        new Paragraph({ children: [new TextRun({ text: reportData.conclusion, bold: true })] }),
        new Paragraph({ children: [new TextRun({ text: ' ' })] }),
        new Paragraph({ children: [new TextRun({ text: ' ' })] }),
        new Paragraph({ children: [new TextRun({ text: 'Эксперт: _________________ /_________________/' })] }),
      );

      const doc = new Document({ sections: [{ children }] });
      const base64String = await Packer.toBase64String(doc);
      const fileUri = `${FileSystem.documentDirectory}expert_report_${reportData.number || reportData.caseNumber}.docx`;
      
      await FileSystem.writeAsStringAsync(fileUri, base64String, { encoding: FileSystem.EncodingType.Base64 });
      
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        dialogTitle: 'Поделиться заключением эксперта',
      });

      // Сохранение в базу данных к конкретному делу
      await addDoc(collection(db, 'expertReports'), {
        ...reportData,
        questions,
        authorId: auth.currentUser?.uid || 'offline_user',
        createdAt: serverTimestamp()
      });

      Alert.alert('✅ Успех', 'Заключение сохранено в базе данных и экспортировано!');
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось сохранить: ' + e.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>⬅ Назад</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Заключение эксперта</Text>
      </View>

      <ScrollView style={styles.form}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Общие данные</Text>
          <Text style={styles.label}>Номер заключения</Text>
          <TextInput style={styles.input} value={reportData.number} onChangeText={t => updateField('number', t)} placeholder="ЭК-2026/001" placeholderTextColor="#4a5568" />
          
          <Text style={styles.label}>Дата</Text>
          <TextInput style={styles.input} value={reportData.date} onChangeText={t => updateField('date', t)} />
          
          <Text style={styles.label}>Номер уголовного дела *</Text>
          <TextInput style={styles.input} value={reportData.caseNumber} onChangeText={t => updateField('caseNumber', t)} placeholder="Обязательно: № 123456/2026" placeholderTextColor="#4a5568" />
          
          <Text style={styles.label}>ФИО эксперта *</Text>
          <TextInput style={styles.input} value={reportData.expert} onChangeText={t => updateField('expert', t)} placeholder="Иванов Иван Иванович" placeholderTextColor="#4a5568" />
          
          <Text style={styles.label}>Квалификация</Text>
          <TextInput style={styles.input} value={reportData.expertQualification} onChangeText={t => updateField('expertQualification', t)} placeholder="Эксперт-криминалист, стаж 10 лет" placeholderTextColor="#4a5568" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❓ Вопросы и ответы</Text>
          {questions.map((q, i) => (
            <View key={q.id} style={styles.questionCard}>
              <Text style={styles.label}>Вопрос №{i + 1}</Text>
              <TextInput style={styles.input} value={q.text} onChangeText={t => updateQuestion(q.id, 'text', t)} placeholder={`Сформулируйте вопрос №${i + 1}...`} placeholderTextColor="#4a5568" />
              <Text style={styles.label}>Ответ эксперта</Text>
              <TextInput style={[styles.input, styles.textArea]} value={q.answer} onChangeText={t => updateQuestion(q.id, 'answer', t)} multiline placeholder={`Развёрнутый ответ на вопрос №${i + 1}...`} placeholderTextColor="#4a5568" />
              {questions.length > 1 && (
                <TouchableOpacity onPress={() => removeQuestion(q.id)} style={{ alignSelf: 'flex-end', marginTop: 5 }}>
                  <Text style={{ color: '#e74c3c' }}>❌ Удалить вопрос</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity style={styles.addBtn} onPress={addQuestion}>
            <Text style={styles.addText}>+ Добавить вопрос</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Представленные объекты</Text>
          <TextInput style={[styles.input, styles.textArea]} value={reportData.objects} onChangeText={t => updateField('objects', t)} multiline placeholder="1. Стеклянная бутылка\n2. Дактилоскопическая плёнка" placeholderTextColor="#4a5568" />
          
          <Text style={styles.label}>Методы исследования</Text>
          <TextInput style={[styles.input, styles.textArea]} value={reportData.researchMethods} onChangeText={t => updateField('researchMethods', t)} multiline placeholder="Визуальный осмотр, дактилоскопирование..." placeholderTextColor="#4a5568" />
          
          <Text style={styles.label}>Результаты исследования</Text>
          <TextInput style={[styles.input, styles.textArea]} value={reportData.findings} onChangeText={t => updateField('findings', t)} multiline placeholder="На поверхности обнаружены 3 пригодных следа..." placeholderTextColor="#4a5568" />
          
          <Text style={styles.label}>ВЫВОДЫ</Text>
          <TextInput style={[styles.input, styles.textArea]} value={reportData.conclusion} onChangeText={t => updateField('conclusion', t)} multiline placeholder="1. На бутылке имеются следы пальцев рук..." placeholderTextColor="#4a5568" />
        </View>

        <TouchableOpacity style={styles.exportBtn} onPress={handleSaveAndExport}>
          <Text style={styles.exportText}>💾 Сохранить и экспортировать в Word</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  backBtn: { fontSize: 16, color: '#2980b9', fontWeight: 'bold', marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  form: { flex: 1, padding: 10 },
  section: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 10 },
  label: { fontSize: 14, color: '#7f8c8d', marginBottom: 4, marginTop: 10 },
  input: { backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', fontSize: 15, color: '#2c3e50' },
  textArea: { height: 100, textAlignVertical: 'top' },
  questionCard: { backgroundColor: '#f8f9fa', padding: 10, borderRadius: 8, marginBottom: 10 },
  addBtn: { marginTop: 5, padding: 10, backgroundColor: '#ecf0f1', borderRadius: 6, alignItems: 'center' },
  addText: { color: '#2c3e50', fontWeight: 'bold', fontSize: 13 },
  exportBtn: { backgroundColor: '#2980b9', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  exportText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
