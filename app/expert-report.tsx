// app/expert-report.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

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

  const updateField = (field, value) => setReportData(prev => ({ ...prev, [field]: value }));

  const handleExport = async () => {
  const children = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'ЗАКЛЮЧЕНИЕ ЭКСПЕРТА', bold: true, size: 32 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `№ ${reportData.number} от ${reportData.date}`, size: 24 })],
    }),
    new Paragraph({ children: [new TextRun({ text: ' ' })] }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Эксперт: ', bold: true }),
        new TextRun({ text: reportData.expert }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Квалификация: ', bold: true }),
        new TextRun({ text: reportData.expertQualification }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'По уголовному делу №: ', bold: true }),
        new TextRun({ text: reportData.caseNumber }),
      ],
    }),
    new Paragraph({ children: [new TextRun({ text: ' ' })] }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Поставленные вопросы:', bold: true, underline: {} }),
      ],
    }),
    new Paragraph({ children: [new TextRun({ text: reportData.question })] }),
    new Paragraph({ children: [new TextRun({ text: ' ' })] }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Представленные объекты:', bold: true, underline: {} }),
      ],
    }),
    new Paragraph({ children: [new TextRun({ text: reportData.objects })] }),
    new Paragraph({ children: [new TextRun({ text: ' ' })] }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Методы исследования:', bold: true, underline: {} }),
      ],
    }),
    new Paragraph({ children: [new TextRun({ text: reportData.researchMethods })] }),
    new Paragraph({ children: [new TextRun({ text: ' ' })] }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Результаты исследования:', bold: true, underline: {} }),
      ],
    }),
    new Paragraph({ children: [new TextRun({ text: reportData.findings })] }),
    new Paragraph({ children: [new TextRun({ text: ' ' })] }),
    new Paragraph({
      children: [
        new TextRun({ text: 'ВЫВОДЫ:', bold: true, underline: {}, size: 26 }),
      ],
    }),
    new Paragraph({ children: [new TextRun({ text: reportData.conclusion, bold: true })] }),
    new Paragraph({ children: [new TextRun({ text: ' ' })] }),
    new Paragraph({ children: [new TextRun({ text: ' ' })] }),
    new Paragraph({
      children: [new TextRun({ text: 'Эксперт: _________________ /_________________/' })],
    }),
  ];

  const doc = new Document({ sections: [{ children }] });
  
  // ✅ ИСПРАВЛЕНИЕ: Используем toBase64String
  const base64String = await Packer.toBase64String(doc);
  const fileUri = `${FileSystem.documentDirectory}expert_report_${reportData.number}.docx`;
  
  await FileSystem.writeAsStringAsync(fileUri, base64String, {
    encoding: FileSystem.EncodingType.Base64,
  });
  
  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    dialogTitle: 'Поделиться заключением эксперта',
  });
};

    const doc = new Document({ sections: [{ children }] });
    const blob = await Packer.toBlob(doc);
    const fileUri = `${FileSystem.documentDirectory}expert_report_${reportData.number}.docx`;
    
    // Конвертация blob в base64 и сохранение
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result.split(',')[1];
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      await Sharing.shareAsync(fileUri);
    };
    reader.readAsDataURL(blob);
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
          <Text style={styles.label}>Номер заключения</Text>
          <TextInput style={styles.input} value={reportData.number} onChangeText={t => updateField('number', t)} placeholder="ЭК-2026/001" placeholderTextColor="#4a5568" />
          
          <Text style={styles.label}>Дата</Text>
          <TextInput style={styles.input} value={reportData.date} onChangeText={t => updateField('date', t)} />
          
          <Text style={styles.label}>ФИО эксперта</Text>
          <TextInput style={styles.input} value={reportData.expert} onChangeText={t => updateField('expert', t)} placeholder="Иванов Иван Иванович, эксперт-криминалист" placeholderTextColor="#4a5568" />
          
          <Text style={styles.label}>Квалификация</Text>
          <TextInput style={styles.input} value={reportData.expertQualification} onChangeText={t => updateField('expertQualification', t)} placeholder="Специалист в области трасологии, стаж 10 лет" placeholderTextColor="#4a5568" />
          
          <Text style={styles.label}>Номер уголовного дела</Text>
          <TextInput style={styles.input} value={reportData.caseNumber} onChangeText={t => updateField('caseNumber', t)} placeholder="№ 123456 от 01.01.2026" placeholderTextColor="#4a5568" />
          
          <Text style={styles.label}>Поставленные вопросы</Text>
          <TextInput style={[styles.input, styles.textArea]} value={reportData.question} onChangeText={t => updateField('question', t)} multiline placeholder="1. Имеются ли на представленных объектах следы пальцев рук?\n2. Каков механизм образования следов?" placeholderTextColor="#4a5568" />
          
          <Text style={styles.label}>Представленные объекты</Text>
          <TextInput style={[styles.input, styles.textArea]} value={reportData.objects} onChangeText={t => updateField('objects', t)} multiline placeholder="1. Стеклянная бутылка объёмом 0.5 л\n2. Дактилоскопическая плёнка с отпечатками" placeholderTextColor="#4a5568" />
          
          <Text style={styles.label}>Методы исследования</Text>
          <TextInput style={[styles.input, styles.textArea]} value={reportData.researchMethods} onChangeText={t => updateField('researchMethods', t)} multiline placeholder="Визуальный осмотр, дактилоскопирование порошком, сравнительный анализ" placeholderTextColor="#4a5568" />
          
          <Text style={styles.label}>Результаты исследования</Text>
          <TextInput style={[styles.input, styles.textArea]} value={reportData.findings} onChangeText={t => updateField('findings', t)} multiline placeholder="На поверхности бутылки обнаружены 3 пригодных для идентификации следа пальцев рук..." placeholderTextColor="#4a5568" />
          
          <Text style={styles.label}>ВЫВОДЫ</Text>
          <TextInput style={[styles.input, styles.textArea]} value={reportData.conclusion} onChangeText={t => updateField('conclusion', t)} multiline placeholder="1. На бутылке имеются следы пальцев рук, пригодные для идентификации.\n2. Следы оставлены одним лицом." placeholderTextColor="#4a5568" />
        </View>

        <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
          <Text style={styles.exportText}>📤 Экспортировать в Word</Text>
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
  label: { fontSize: 14, color: '#7f8c8d', marginBottom: 4, marginTop: 10 },
  input: { backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', fontSize: 15 },
  textArea: { height: 100, textAlignVertical: 'top' },
  exportBtn: { backgroundColor: '#2980b9', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  exportText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
