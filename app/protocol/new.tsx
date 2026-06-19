// app/protocol/new.tsx (полный код с улучшенными подсказками)
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StyleSheet, Share } from 'react-native';
import { router } from 'expo-router';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../src/config/firebase';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

export default function NewProtocolScreen() {
  const [loading, setLoading] = useState(false);
  
  // 1. Общие сведения
  const [reasonForCall, setReasonForCall] = useState('');
  const [callerName, setCallerName] = useState('');
  const [dateTime, setDateTime] = useState(new Date().toLocaleString('ru-RU'));
  const [address, setAddress] = useState('');
  
  // 2. Процедурные
  const [helpProvided, setHelpProvided] = useState('');
  const [isGuarded, setIsGuarded] = useState('');
  const [strangersRemoved, setStrangersRemoved] = useState('');
  const [witnessesWarned, setWitnessesWarned] = useState('');
  const [witnessesInProcedural, setWitnessesInProcedural] = useState('');
  const [eyewitnessesInProcedural, setEyewitnessesInProcedural] = useState('');

  // 3. Очевидцы + Показания
  const [eyewitnessInterview, setEyewitnessInterview] = useState('');
  const [eyewitnessesList, setEyewitnessesList] = useState([]);
  const [eyewitnessTestimony, setEyewitnessTestimony] = useState('');

  // 4. Понятые
  const [witnessesPresent, setWitnessesPresent] = useState('');
  const [witnessesList, setWitnessesList] = useState([]);
  
  // 5. Специалисты
  const [specialistsInvolved, setSpecialistsInvolved] = useState('');
  const [specialistsList, setSpecialistsList] = useState([]);
  
  // 6. Тех. средства
  const [technicalMeans, setTechnicalMeans] = useState('');
  
  // 7. Видеосъемка
  const [videoRecording, setVideoRecording] = useState('');
  const [videoStartTime, setVideoStartTime] = useState('');
  const [videoEndTime, setVideoEndTime] = useState('');
  const [videoPauseTime, setVideoPauseTime] = useState('');

  // 8. Следы
  const [checklist, setChecklist] = useState([
    { id: 1, name: 'Следы шин/транспорта', checked: false, comment: '' },
    { id: 2, name: 'Следы обуви', checked: false, comment: '' },
    { id: 3, name: 'Следы крови', checked: false, comment: '' },
    { id: 4, name: 'Иные биологические следы', checked: false, comment: '' },
    { id: 5, name: 'Орудия преступления', checked: false, comment: '' },
    { id: 6, name: 'Взлом/Повреждения', checked: false, comment: '' },
  ]);

  // 9. Изъято
  const [seizedItems, setSeizedItems] = useState('');
  
  // 10. Приложения и Файлы
  const [attachmentsText, setAttachmentsText] = useState('');
  const [filesList, setFilesList] = useState([]);

  // --- Логика списков ---
  const toggleCheck = (id) => setChecklist(checklist.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  
  const addEyewitness = () => setEyewitnessesList([...eyewitnessesList, { id: Date.now(), fio: '', address: '' }]);
  const removeEyewitness = (id) => setEyewitnessesList(eyewitnessesList.filter(w => w.id !== id));
  const updateEyewitness = (id, field, text) => setEyewitnessesList(eyewitnessesList.map(w => w.id === id ? { ...w, [field]: text } : w));

  const addWitness = () => setWitnessesList([...witnessesList, { id: Date.now(), fio: '', address: '' }]);
  const removeWitness = (id) => setWitnessesList(witnessesList.filter(w => w.id !== id));
  const updateWitness = (id, field, text) => setWitnessesList(witnessesList.map(w => w.id === id ? { ...w, [field]: text } : w));
  
  const addSpecialist = () => setSpecialistsList([...specialistsList, { id: Date.now(), name: '', role: '' }]);
  const removeSpecialist = (id) => setSpecialistsList(specialistsList.filter(s => s.id !== id));
  const updateSpecialist = (id, field, text) => setSpecialistsList(specialistsList.map(s => s.id === id ? { ...s, [field]: text } : s));

  // Выбор файлов
  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (!result.canceled) {
        const file = result.assets[0];
        setFilesList(prev => [...prev, { id: Date.now(), name: file.name, uri: file.uri, type: file.mimeType || 'file' }]);
      }
    } catch (err) { Alert.alert('Ошибка', 'Не удалось выбрать файл'); }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        return Alert.alert('Требуется разрешение', 'Для прикрепления фото необходимо дать доступ к галерее в настройках приложения.');
      }
      const mediaType = ImagePicker.MediaType?.Images ?? ImagePicker.MediaTypeOptions?.Images ?? ImagePicker.MediaTypeOptions.All;
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: mediaType, allowsEditing: false, quality: 0.8 });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const img = result.assets[0];
        setFilesList(prev => [...prev, { id: Date.now(), name: img.fileName || `photo_${Date.now()}.jpg`, uri: img.uri, type: img.mimeType || 'image/jpeg' }]);
      }
    } catch (error) {
      console.error('Ошибка выбора фото:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать фото. Попробуйте ещё раз.');
    }
  };

  // Генерация номера
  const generateNumber = () => {
    const d = new Date();
    const dateStr = `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
    return `ОСМ-${dateStr}-${Math.floor(Math.random() * 900 + 100)}`;
  };

  // Сохранение
  const handleSave = async () => {
    if (!address || !reasonForCall) return Alert.alert('Ошибка', 'Заполните Адрес и Причину вызова');
    
    setLoading(true);
    try {
      const protocolData = {
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.email,
        protocolNumber: generateNumber(),
        reasonForCall, callerName, dateTime, address,
        helpProvided, isGuarded, strangersRemoved, witnessesWarned,
        witnessesInProcedural, eyewitnessesInProcedural,
        eyewitnessInterview, eyewitnessesList, eyewitnessTestimony,
        witnessesPresent, witnessesList,
        specialistsInvolved, specialistsList,
        technicalMeans,
        videoRecording, videoStartTime, videoEndTime, videoPauseTime,
        checklist, seizedItems, attachmentsText, filesList,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'protocols'), protocolData);
      Alert.alert('✅ Успех', 'Протокол сохранён в архив!');
      router.back();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сохранить: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Экспорт
  const handleExport = async () => {
    let text = `📋 ПРОТОКОЛ ОСМОТРА — Помощник Следователя\n🔢 ${generateNumber()}\n📅 ${dateTime}\n📍 ${address}\n\n`;
    text += `📞 Причина: ${reasonForCall}\n👤 Вызвал: ${callerName || '—'}\n\n`;
    text += `⚖️ Процедурные:\n• Помощь: ${helpProvided} | Охрана: ${isGuarded}\n• Посторонние: ${strangersRemoved}\n• Предупреждение: ${witnessesWarned}\n• Понятые: ${witnessesInProcedural} | Очевидцы: ${eyewitnessesInProcedural}\n\n`;
    
    if (eyewitnessInterview === 'Да' || eyewitnessesInProcedural === 'Да') {
      text += `👁️ Опрос очевидцев:\n` +
        eyewitnessesList.map((w,i) => `${i+1}. ${w.fio || '—'} (${w.address || '—'})`).join('\n') + '\n';
      text += `💬 Показания:\n${eyewitnessTestimony || '—'}\n\n`;
    }

    if (witnessesPresent === 'Да' || witnessesInProcedural === 'Да') {
      text += `👥 Понятые:\n` + witnessesList.map((w,i) => `${i+1}. ${w.fio} (${w.address})`).join('\n') + '\n\n';
    }

    if (videoRecording === 'Да') {
      text += `🎥 Видеосъемка:\n• Начало: ${videoStartTime}\n• Окончание: ${videoEndTime || '—'}\n• Перерыв: ${videoPauseTime || 'Нет'}\n\n`;
    }

    text += `🔍 Следы: ${checklist.filter(c => c.checked).map(c => c.name).join(', ') || 'Не обнаружены'}\n`;
    text += `📦 Изъято: ${seizedItems || '—'}\n`;
    text += `📎 Файлы: ${filesList.length ? filesList.map(f => f.name).join(', ') : '—'}\n\n`;
    text += `📝 Сформировано в Помощник Следователя`;

    try {
      await Share.share({ message: text, title: 'Протокол осмотра' });
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось поделиться');
    }
  };

  // Эффект: если в процедурных нажали "Да" → открываем соответствующий раздел
  React.useEffect(() => {
    if (witnessesInProcedural === 'Да') setWitnessesPresent('Да');
    if (eyewitnessesInProcedural === 'Да') setEyewitnessInterview('Да');
  }, [witnessesInProcedural, eyewitnessesInProcedural]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>⬅ Назад</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Новый осмотр</Text>
      </View>

      <ScrollView style={styles.form} contentContainerStyle={{paddingBottom: 40}}>
        
        <Section title="📞 Общие сведения">
          <Field label="Причина вызова" value={reasonForCall} onChange={setReasonForCall} placeholder="Опишите причину: поступило сообщение о краже из квартиры, обнаружении тела и т.д." />
          <Field label="Кто вызвал" value={callerName} onChange={setCallerName} placeholder="ФИО заявителя полностью и контактный телефон" />
          <Field label="Дата и время" value={dateTime} onChange={setDateTime} />
          <Field label="Адрес" value={address} onChange={setAddress} multiline placeholder="Полный адрес: г. Москва, ул. Ленина, д. 1, кв. 1, подъезд 2, этаж 3" />
        </Section>

        <Section title="⚖️ Процедурные вопросы">
          <Toggle label="Оказана помощь?" value={helpProvided} onChange={setHelpProvided} />
          <Toggle label="Место охраняется?" value={isGuarded} onChange={setIsGuarded} />
          <Toggle label="Посторонние удалены?" value={strangersRemoved} onChange={setStrangersRemoved} />
          <Toggle label="Понятые предупреждены?" value={witnessesWarned} onChange={setWitnessesWarned} />
          <Toggle label="Присутствуют понятые?" value={witnessesInProcedural} onChange={setWitnessesInProcedural} />
          <Toggle label="Присутствуют очевидцы?" value={eyewitnessesInProcedural} onChange={setEyewitnessesInProcedural} />
        </Section>

        <Section title="👁️ Опрос очевидцев">
          <Toggle label="Проведен опрос?" value={eyewitnessInterview} onChange={setEyewitnessInterview} />
          {eyewitnessInterview === 'Да' && (
            <>
              {eyewitnessesList.map(w => (
                <View key={w.id} style={styles.card}>
                  <TextInput style={styles.miniInput} placeholder="ФИО очевидца полностью (Иванов Иван Иванович)" placeholderTextColor="#4a5568" value={w.fio} onChangeText={t => updateEyewitness(w.id, 'fio', t)} />
                  <TextInput style={styles.miniInput} placeholder="Адрес проживания (г. Москва, ул. Пушкина, д. 5, кв. 10)" placeholderTextColor="#4a5568" value={w.address} onChangeText={t => updateEyewitness(w.id, 'address', t)} />
                  <TouchableOpacity onPress={() => removeEyewitness(w.id)}><Text style={styles.delText}>❌</Text></TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addBtn} onPress={addEyewitness}><Text style={styles.addText}>+ Добавить очевидца</Text></TouchableOpacity>
              <Field label="Что рассказали очевидцы?" value={eyewitnessTestimony} onChange={setEyewitnessTestimony} multiline placeholder="Подробно опишите показания: что видели, слышали, когда это произошло, кто участвовал..." />
            </>
          )}
        </Section>

        <Section title="👥 Понятые">
          <Toggle label="Присутствуют?" value={witnessesPresent} onChange={setWitnessesPresent} />
          {witnessesPresent === 'Да' && (
            <>
              {witnessesList.map(w => (
                <View key={w.id} style={styles.card}>
                  <TextInput style={styles.miniInput} placeholder="ФИО понятого полностью (Петров Пётр Петрович)" placeholderTextColor="#4a5568" value={w.fio} onChangeText={t => updateWitness(w.id, 'fio', t)} />
                  <TextInput style={styles.miniInput} placeholder="Адрес проживания (г. Москва, ул. Гагарина, д. 10, кв. 25)" placeholderTextColor="#4a5568" value={w.address} onChangeText={t => updateWitness(w.id, 'address', t)} />
                  <TouchableOpacity onPress={() => removeWitness(w.id)}><Text style={styles.delText}>❌</Text></TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addBtn} onPress={addWitness}><Text style={styles.addText}>+ Добавить понятого</Text></TouchableOpacity>
            </>
          )}
        </Section>

        <Section title="🔧 Специалисты">
          <Toggle label="Участвуют?" value={specialistsInvolved} onChange={setSpecialistsInvolved} />
          {specialistsInvolved === 'Да' && (
            <>
              {specialistsList.map(s => (
                <View key={s.id} style={styles.card}>
                  <TextInput style={styles.miniInput} placeholder="ФИО специалиста (Сидоров С.С., эксперт-криминалист)" placeholderTextColor="#4a5568" value={s.name} onChangeText={t => updateSpecialist(s.id, 'name', t)} />
                  <TextInput style={styles.miniInput} placeholder="Роль: дактилоскопист, трасолог, фотограф и т.д." placeholderTextColor="#4a5568" value={s.role} onChangeText={t => updateSpecialist(s.id, 'role', t)} />
                  <TouchableOpacity onPress={() => removeSpecialist(s.id)}><Text style={styles.delText}>❌</Text></TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addBtn} onPress={addSpecialist}><Text style={styles.addText}>+ Добавить специалиста</Text></TouchableOpacity>
            </>
          )}
        </Section>

        <Section title="📹 Технические средства">
          <Field label="Какие использованы?" value={technicalMeans} onChange={setTechnicalMeans} multiline placeholder="Перечислите: фотоаппарат Canon EOS 5D, дрон DJI Mavic, сканер отпечатков пальцев и т.д." />
        </Section>

        <Section title="🎥 Видеосъемка">
          <Toggle label="Велась съемка?" value={videoRecording} onChange={setVideoRecording} />
          {videoRecording === 'Да' && (
            <View style={{marginTop: 10}}>
              <Field label="Время начала" value={videoStartTime} onChange={setVideoStartTime} placeholder="Например: 14:30 (обязательно укажите час и минуты)" />
              <Field label="Время окончания" value={videoEndTime} onChange={setVideoEndTime} placeholder="Например: 15:45 (обязательно укажите час и минуты)" />
              <Field label="Перерыв (время)" value={videoPauseTime} onChange={setVideoPauseTime} placeholder="Если был перерыв, укажите время: 15:00-15:10" />
            </View>
          )}
        </Section>

        <Section title="🔍 Обнаруженные следы">
          {checklist.map(item => (
            <View key={item.id} style={styles.checkRow}>
              <TouchableOpacity style={[styles.checkBtn, item.checked && styles.checkBtnActive]} onPress={() => toggleCheck(item.id)}>
                <Text style={[styles.checkText, item.checked && styles.checkTextActive]}>{item.checked ? '✅' : '⬜'}</Text>
              </TouchableOpacity>
              <Text style={styles.checkLabel}>{item.name}</Text>
            </View>
          ))}
        </Section>

        <Section title="📦 Изъято">
          <Field label="Что изъято?" value={seizedItems} onChange={setSeizedItems} multiline placeholder="Перечислите все изъятые предметы: лом металлический длиной 50 см, отмычка, следы обуви размер 42 и т.д." />
        </Section>

        <Section title="📎 Приложения к протоколу">
          <Field label="Описание приложений" value={attachmentsText} onChange={setAttachmentsText} multiline placeholder="Фототаблица на 10 листах, схема места происшествия, план помещения и т.д." />
          <View style={{marginTop: 10}}>
            <Text style={styles.label}>Прикрепленные файлы:</Text>
            {filesList.map(f => <Text key={f.id} style={styles.fileText}>📎 {f.name}</Text>)}
            <View style={{flexDirection:'row', gap:10, marginTop:10}}>
              <TouchableOpacity style={[styles.addBtn, {flex:1}]} onPress={handlePickFile}>
                <Text style={styles.addText}>📄 Выбрать файл</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.addBtn, {flex:1}]} onPress={handlePickImage}>
                <Text style={styles.addText}>🖼️ Выбрать фото</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Section>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>💾 Сохранить</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
            <Text style={styles.exportText}>📤 Экспорт</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// --- Вспомогательные компоненты ---
function Section({ title, children }) { return (<View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>); }
function Field({ label, value, onChange, multiline, placeholder }) { return (<View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput style={[styles.input, multiline && styles.textArea]} value={value} onChangeText={onChange} multiline={multiline} placeholder={placeholder} placeholderTextColor="#4a5568" /></View>); }
function Toggle({ label, value, onChange }) { return (<View style={styles.toggleRow}><Text style={styles.toggleLabel}>{label}</Text><View style={styles.toggleBtns}><TouchableOpacity style={[styles.tBtn, value === 'Да' && styles.tBtnActive]} onPress={() => onChange('Да')}><Text style={[styles.tText, value === 'Да' && styles.tTextActive]}>Да</Text></TouchableOpacity><TouchableOpacity style={[styles.tBtn, value === 'Нет' && styles.tBtnActive]} onPress={() => onChange('Нет')}><Text style={[styles.tText, value === 'Нет' && styles.tTextActive]}>Нет</Text></TouchableOpacity></View></View>); }

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  backBtn: { fontSize: 16, color: '#2980b9', fontWeight: 'bold', marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  form: { flex: 1 },
  section: { backgroundColor: '#fff', padding: 15, marginBottom: 10, borderRadius: 10, elevation: 1 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 10 },
  field: { marginBottom: 12 },
  label: { fontSize: 14, color: '#7f8c8d', marginBottom: 4 },
  input: { backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', fontSize: 15 },
  textArea: { height: 80, textAlignVertical: 'top' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  toggleLabel: { fontSize: 14, color: '#34495e' },
  toggleBtns: { flexDirection: 'row', gap: 8 },
  tBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#bdc3c7' },
  tBtnActive: { backgroundColor: '#27ae60', borderColor: '#27ae60' },
  tText: { fontSize: 13, color: '#7f8c8d', fontWeight: '600' },
  tTextActive: { color: '#fff' },
  card: { flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'center', backgroundColor: '#f8f9fa', padding: 8, borderRadius: 6 },
  miniInput: { flex: 1, backgroundColor: '#fff', padding: 8, borderRadius: 6, fontSize: 13, borderWidth: 1, borderColor: '#e0e0e0' },
  delText: { fontSize: 16 },
  addBtn: { marginTop: 5, padding: 10, backgroundColor: '#ecf0f1', borderRadius: 6, alignItems: 'center' },
  addText: { color: '#2c3e50', fontWeight: 'bold', fontSize: 13 },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checkBtn: { width: 32, height: 32, borderRadius: 6, borderWidth: 1, borderColor: '#bdc3c7', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  checkBtnActive: { backgroundColor: '#e8f5e9', borderColor: '#27ae60' },
  checkText: { fontSize: 18 },
  checkTextActive: { color: '#27ae60' },
  buttonRow: { flexDirection: 'row', gap: 10, padding: 15 },
  saveBtn: { flex: 1, backgroundColor: '#2980b9', padding: 14, borderRadius: 10, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  exportBtn: { flex: 1, backgroundColor: '#e74c3c', padding: 14, borderRadius: 10, alignItems: 'center' },
  exportText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  fileText: { fontSize: 13, color: '#2980b9', marginBottom: 4 }
});
