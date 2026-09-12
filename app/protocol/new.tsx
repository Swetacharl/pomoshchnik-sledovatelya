// app/protocol/new.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StyleSheet, Share } from 'react-native';
import { router } from 'expo-router';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../src/config/firebase';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { checkInternet, saveProtocolLocally } from '../../src/syncManager';

export default function NewProtocolScreen() {
  const [loading, setLoading] = useState(false);
  
  // 1. Общие сведения
  const [crimeArticle, setCrimeArticle] = useState('');
  const [officerName, setOfficerName] = useState('');
  const [officerPhone, setOfficerPhone] = useState('');
  const [callerName, setCallerName] = useState('');
  const [callerPhone, setCallerPhone] = useState('');
  const [dateTime, setDateTime] = useState(new Date().toLocaleString('ru-RU'));
  const [address, setAddress] = useState('');
  
  // 2. Процедурные
  const [helpProvided, setHelpProvided] = useState('');
  const [helpPersonName, setHelpPersonName] = useState('');
  const [helpPersonPhone, setHelpPersonPhone] = useState('');
  const [helpPersonAddress, setHelpPersonAddress] = useState('');
  const [isGuarded, setIsGuarded] = useState('');
  const [strangersRemoved, setStrangersRemoved] = useState('');
  const [witnessesWarned, setWitnessesWarned] = useState('');
  const [witnessesInProcedural, setWitnessesInProcedural] = useState('');
  const [eyewitnessesInProcedural, setEyewitnessesInProcedural] = useState('');

  // 3. Очевидцы
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
  
  // 10. Вопросы эксперту
  const [expertQuestions, setExpertQuestions] = useState([{ id: 1, text: '' }]);
  
  // 11. Приложения и Файлы
  const [attachmentsText, setAttachmentsText] = useState('');
  const [filesList, setFilesList] = useState([]);

  // --- Логика списков ---
  const toggleCheck = (id) => setChecklist(checklist.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  const updateChecklistComment = (id, text) => setChecklist(checklist.map(i => i.id === id ? { ...i, comment: text } : i));
  
  const addEyewitness = () => setEyewitnessesList([...eyewitnessesList, { id: Date.now(), fio: '', address: '', phone: '' }]);
  const removeEyewitness = (id) => setEyewitnessesList(eyewitnessesList.filter(w => w.id !== id));
  const updateEyewitness = (id, field, text) => setEyewitnessesList(eyewitnessesList.map(w => w.id === id ? { ...w, [field]: text } : w));

  const addWitness = () => setWitnessesList([...witnessesList, { id: Date.now(), fio: '', address: '', phone: '' }]);
  const removeWitness = (id) => setWitnessesList(witnessesList.filter(w => w.id !== id));
  const updateWitness = (id, field, text) => setWitnessesList(witnessesList.map(w => w.id === id ? { ...w, [field]: text } : w));
  
  const addSpecialist = () => setSpecialistsList([...specialistsList, { id: Date.now(), name: '', role: '', phone: '' }]);
  const removeSpecialist = (id) => setSpecialistsList(specialistsList.filter(s => s.id !== id));
  const updateSpecialist = (id, field, text) => setSpecialistsList(specialistsList.map(s => s.id === id ? { ...s, [field]: text } : s));

  const addExpertQuestion = () => setExpertQuestions([...expertQuestions, { id: Date.now(), text: '' }]);
  const removeExpertQuestion = (id) => setExpertQuestions(expertQuestions.filter(q => q.id !== id));
  const updateExpertQuestion = (id, text) => setExpertQuestions(expertQuestions.map(q => q.id === id ? { ...q, text } : q));

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
      if (status !== 'granted') return Alert.alert('Требуется разрешение', 'Для прикрепления фото необходимо дать доступ к галерее.');
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaType.Images, allowsEditing: false, quality: 0.8 });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const img = result.assets[0];
        setFilesList(prev => [...prev, { id: Date.now(), name: img.fileName || `photo_${Date.now()}.jpg`, uri: img.uri, type: img.mimeType || 'image/jpeg' }]);
      }
    } catch (error) { Alert.alert('Ошибка', 'Не удалось выбрать фото.'); }
  };

  const generateNumber = () => {
    const d = new Date();
    const dateStr = `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
    return `ОСМ-${dateStr}-${Math.floor(Math.random() * 900 + 100)}`;
  };

  const handleSave = async () => {
    if (!address || !officerName) return Alert.alert('Ошибка', 'Заполните Адрес и ФИО должностного лица');
    
    setLoading(true);
    try {
      const protocolData = {
        authorId: auth.currentUser?.uid || 'offline_user',
        authorName: auth.currentUser?.email || 'Офлайн пользователь',
        protocolNumber: generateNumber(),
        crimeArticle, officerName, officerPhone,
        callerName, callerPhone, dateTime, address,
        helpProvided, helpPersonName, helpPersonPhone, helpPersonAddress,
        isGuarded, strangersRemoved, witnessesWarned,
        witnessesInProcedural, eyewitnessesInProcedural,
        eyewitnessInterview, eyewitnessesList, eyewitnessTestimony,
        witnessesPresent, witnessesList,
        specialistsInvolved, specialistsList,
        technicalMeans,
        videoRecording, videoStartTime, videoEndTime, videoPauseTime,
        checklist, seizedItems, expertQuestions, attachmentsText, filesList,
      };

      const hasInternet = await checkInternet();
      
      if (hasInternet) {
        await addDoc(collection(db, 'protocols'), { ...protocolData, createdAt: serverTimestamp() });
        Alert.alert('✅ Успех', 'Протокол сохранён и отправлен в облако!');
      } else {
        await saveProtocolLocally(protocolData);
        Alert.alert('💾 Сохранено', 'Нет связи. Протокол сохранён локально и будет отправлен при появлении интернета.');
      }

      router.replace('/(tabs)/archive');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сохранить: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const protocolData = {
        protocolNumber: generateNumber(),
        dateTime, address, crimeArticle, officerName,
        callerName, callerPhone,
        helpProvided, helpPersonName, helpPersonPhone, helpPersonAddress,
        witnessesList, eyewitnessesList, specialistsList,
        checklist, seizedItems, technicalMeans,
        videoRecording, videoStartTime, videoEndTime,
        expertQuestions,
      };
      const { exportProtocolToWord } = await import('../../src/exportProtocol');
      await exportProtocolToWord(protocolData, [], filesList.filter(f => f.type?.startsWith('image')));
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось экспортировать: ' + e.message);
    }
  };

  React.useEffect(() => {
    if (witnessesInProcedural === 'Да') setWitnessesPresent('Да');
    if (eyewitnessesInProcedural === 'Да') setEyewitnessInterview('Да');
  }, [witnessesInProcedural, eyewitnessesInProcedural]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/home')}>
          <Text style={styles.backBtn}>⬅ Отмена</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Новый осмотр</Text>
      </View>

      <ScrollView style={styles.form} contentContainerStyle={{paddingBottom: 40}}>
        
        <Section title="📞 Общие сведения">
          <Field label="Квалификация преступления (статья УК РФ)" value={crimeArticle} onChange={setCrimeArticle} placeholder="Например: п. 'а' ч. 2 ст. 158 УК РФ (Кража)" />
          <Field label="ФИО должностного лица" value={officerName} onChange={setOfficerName} placeholder="Следователь Иванов Иван Иванович" />
          <Field label="Телефон должностного лица" value={officerPhone} onChange={setOfficerPhone} placeholder="+7 (___) ___-__-__" />
          <Field label="Обратившийся за помощью" value={callerName} onChange={setCallerName} placeholder="ФИО заявителя полностью" />
          <Field label="Телефон обратившегося" value={callerPhone} onChange={setCallerPhone} placeholder="+7 (___) ___-__-__" />
          <Field label="Дата и время" value={dateTime} onChange={setDateTime} />
          <Field label="Адрес" value={address} onChange={setAddress} multiline placeholder="Полный адрес: г. Москва, ул. Ленина, д. 1, кв. 1" />
        </Section>

        <Section title="⚖️ Процедурные вопросы">
          <Toggle label="Оказана помощь?" value={helpProvided} onChange={setHelpProvided} />
          {helpProvided === 'Да' && (
            <>
              <Field label="ФИО оказавшего помощь" value={helpPersonName} onChange={setHelpPersonName} placeholder="ФИО врача/спасателя" />
              <Field label="Телефон" value={helpPersonPhone} onChange={setHelpPersonPhone} placeholder="+7 (___) ___-__-__" />
              <Field label="Адрес" value={helpPersonAddress} onChange={setHelpPersonAddress} multiline placeholder="Адрес места работы/проживания" />
            </>
          )}
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
                  <TextInput style={styles.miniInput} placeholder="ФИО очевидца" placeholderTextColor="#4a5568" value={w.fio} onChangeText={t => updateEyewitness(w.id, 'fio', t)} />
                  <TextInput style={styles.miniInput} placeholder="Адрес" placeholderTextColor="#4a5568" value={w.address} onChangeText={t => updateEyewitness(w.id, 'address', t)} />
                  <TextInput style={styles.miniInput} placeholder="Телефон" placeholderTextColor="#4a5568" value={w.phone} onChangeText={t => updateEyewitness(w.id, 'phone', t)} />
                  <TouchableOpacity onPress={() => removeEyewitness(w.id)}><Text style={styles.delText}>❌</Text></TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addBtn} onPress={addEyewitness}><Text style={styles.addText}>+ Добавить очевидца</Text></TouchableOpacity>
              <Field label="Что рассказали очевидцы?" value={eyewitnessTestimony} onChange={setEyewitnessTestimony} multiline placeholder="Подробно опишите показания..." />
            </>
          )}
        </Section>

        <Section title="👥 Понятые">
          <Toggle label="Присутствуют?" value={witnessesPresent} onChange={setWitnessesPresent} />
          {witnessesPresent === 'Да' && (
            <>
              {witnessesList.map(w => (
                <View key={w.id} style={styles.card}>
                  <TextInput style={styles.miniInput} placeholder="ФИО понятого" placeholderTextColor="#4a5568" value={w.fio} onChangeText={t => updateWitness(w.id, 'fio', t)} />
                  <TextInput style={styles.miniInput} placeholder="Адрес" placeholderTextColor="#4a5568" value={w.address} onChangeText={t => updateWitness(w.id, 'address', t)} />
                  <TextInput style={styles.miniInput} placeholder="Телефон" placeholderTextColor="#4a5568" value={w.phone} onChangeText={t => updateWitness(w.id, 'phone', t)} />
                  <TouchableOpacity onPress={() => removeWitness(w.id)}><Text style={styles.delText}>❌</Text></TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addBtn} onPress={addWitness}><Text style={styles.addText}>+ Добавить понятого</Text></TouchableOpacity>
            </>
          )}
        </Section>

        <Section title=" Специалисты">
          <Toggle label="Участвуют?" value={specialistsInvolved} onChange={setSpecialistsInvolved} />
          {specialistsInvolved === 'Да' && (
            <>
              {specialistsList.map(s => (
                <View key={s.id} style={styles.card}>
                  <TextInput style={styles.miniInput} placeholder="ФИО специалиста" placeholderTextColor="#4a5568" value={s.name} onChangeText={t => updateSpecialist(s.id, 'name', t)} />
                  <TextInput style={styles.miniInput} placeholder="Роль" placeholderTextColor="#4a5568" value={s.role} onChangeText={t => updateSpecialist(s.id, 'role', t)} />
                  <TextInput style={styles.miniInput} placeholder="Телефон" placeholderTextColor="#4a5568" value={s.phone} onChangeText={t => updateSpecialist(s.id, 'phone', t)} />
                  <TouchableOpacity onPress={() => removeSpecialist(s.id)}><Text style={styles.delText}>❌</Text></TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addBtn} onPress={addSpecialist}><Text style={styles.addText}>+ Добавить специалиста</Text></TouchableOpacity>
            </>
          )}
        </Section>

        <Section title="📹 Технические средства">
          <Field label="Какие использованы?" value={technicalMeans} onChange={setTechnicalMeans} multiline placeholder="Фотоаппарат, дрон..." />
        </Section>

        <Section title="🎥 Видеосъемка">
          <Toggle label="Велась съемка?" value={videoRecording} onChange={setVideoRecording} />
          {videoRecording === 'Да' && (
            <View style={{marginTop: 10}}>
              <Field label="Время начала" value={videoStartTime} onChange={setVideoStartTime} placeholder="14:30" />
              <Field label="Время окончания" value={videoEndTime} onChange={setVideoEndTime} placeholder="15:45" />
              <Field label="Перерыв (время)" value={videoPauseTime} onChange={setVideoPauseTime} placeholder="Если был" />
            </View>
          )}
        </Section>

        <Section title=" Обнаруженные следы">
          {checklist.map(item => (
            <View key={item.id} style={{ marginBottom: 12 }}>
              <View style={styles.checkRow}>
                <TouchableOpacity style={[styles.checkBtn, item.checked && styles.checkBtnActive]} onPress={() => toggleCheck(item.id)}>
                  <Text style={[styles.checkText, item.checked && styles.checkTextActive]}>{item.checked ? '✅' : '⬜'}</Text>
                </TouchableOpacity>
                <Text style={styles.checkLabel}>{item.name}</Text>
              </View>
              {item.checked && (
                <TextInput
                  style={[styles.miniInput, { marginTop: 6, marginLeft: 42 }]}
                  placeholder={`Детали по "${item.name}": размер, цвет, марка, пригодность...`}
                  placeholderTextColor="#4a5568"
                  value={item.comment}
                  onChangeText={(text) => updateChecklistComment(item.id, text)}
                  multiline
                />
              )}
            </View>
          ))}
        </Section>

        <Section title="❓ Вопросы эксперту">
          {expertQuestions.map((q, index) => (
            <View key={q.id} style={styles.card}>
              <Text style={styles.label}>Вопрос №{index + 1}</Text>
              <TextInput
                style={[styles.miniInput, { flex: 1 }]}
                placeholder={`Сформулируйте вопрос №${index + 1}...`}
                placeholderTextColor="#4a5568"
                value={q.text}
                onChangeText={(text) => updateExpertQuestion(q.id, text)}
                multiline
              />
              {expertQuestions.length > 1 && (
                <TouchableOpacity onPress={() => removeExpertQuestion(q.id)}><Text style={styles.delText}></Text></TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity style={styles.addBtn} onPress={addExpertQuestion}>
            <Text style={styles.addText}>+ Добавить вопрос</Text>
          </TouchableOpacity>
        </Section>

        <Section title="📦 Изъято">
          <Field label="Что изъято?" value={seizedItems} onChange={setSeizedItems} multiline placeholder="Перечень предметов..." />
        </Section>

        <Section title="📎 Приложения к протоколу">
          <Field label="Описание приложений" value={attachmentsText} onChange={setAttachmentsText} multiline placeholder="Фототаблица, схема..." />
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
  input: { backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', fontSize: 15, color: '#2c3e50' },
  textArea: { height: 80, textAlignVertical: 'top' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  toggleLabel: { fontSize: 14, color: '#34495e' },
  toggleBtns: { flexDirection: 'row', gap: 8 },
  tBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#bdc3c7' },
  tBtnActive: { backgroundColor: '#27ae60', borderColor: '#27ae60' },
  tText: { fontSize: 13, color: '#7f8c8d', fontWeight: '600' },
  tTextActive: { color: '#fff' },
  card: { flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'center', backgroundColor: '#f8f9fa', padding: 8, borderRadius: 6 },
  miniInput: { flex: 1, backgroundColor: '#fff', padding: 8, borderRadius: 6, fontSize: 13, borderWidth: 1, borderColor: '#e0e0e0', color: '#2c3e50' },
  delText: { fontSize: 16 },
  addBtn: { marginTop: 5, padding: 10, backgroundColor: '#ecf0f1', borderRadius: 6, alignItems: 'center' },
  addText: { color: '#2c3e50', fontWeight: 'bold', fontSize: 13 },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  checkBtn: { width: 32, height: 32, borderRadius: 6, borderWidth: 1, borderColor: '#bdc3c7', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  checkBtnActive: { backgroundColor: '#e8f5e9', borderColor: '#27ae60' },
  checkText: { fontSize: 18 },
  checkTextActive: { color: '#27ae60' },
  checkLabel: { fontSize: 14, color: '#34495e', flex: 1 },
  buttonRow: { flexDirection: 'row', gap: 10, padding: 15 },
  saveBtn: { flex: 1, backgroundColor: '#2980b9', padding: 14, borderRadius: 10, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  exportBtn: { flex: 1, backgroundColor: '#e74c3c', padding: 14, borderRadius: 10, alignItems: 'center' },
  exportText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  fileText: { fontSize: 13, color: '#2980b9', marginBottom: 4 }
});
