// app/signature.tsx
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import SignatureScreen from 'react-native-signature-canvas';

export default function SignatureScreenPage() {
  const { participantType, participantId, participantName } = useLocalSearchParams();
  const [signature, setSignature] = useState(null);

  const handleOK = (sig) => {
    setSignature(sig);
    // Сохраняем подпись в глобальное хранилище (через AsyncStorage или контекст)
    // Пока просто показываем
    Alert.alert('✅ Подпись сохранена', `${participantName || 'Участник'} подписал документ`);
    router.back();
  };

  const handleClear = () => {
    setSignature(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>⬅ Назад</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Подпись участника</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.label}>Тип участника:</Text>
        <Text style={styles.value}>{participantType || '—'}</Text>
        <Text style={styles.label}>ФИО:</Text>
        <Text style={styles.value}>{participantName || '—'}</Text>
      </View>

      <View style={styles.signatureContainer}>
        <SignatureScreen
          onOK={handleOK}
          onEmpty={() => Alert.alert('⚠️', 'Пожалуйста, поставьте подпись')}
          descriptionText="Распишитесь пальцем в этом поле"
          clearText="Очистить"
          confirmText="Сохранить"
          customHtml={customHtml}
          rotated={false}
          webStyle={`
            .m-signature-pad {
              box-shadow: none;
              border: 2px solid #2980b9;
              border-radius: 10px;
              background-color: #fff;
            }
          `}
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
          <Text style={styles.clearText}>🗑️ Очистить</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const customHtml = `
  <style>
    .m-signature-pad {
      width: 100%;
      height: 300px;
    }
    .m-signature-pad--body {
      border: none;
    }
  </style>
`;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  backBtn: { fontSize: 16, color: '#2980b9', fontWeight: 'bold', marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  info: { backgroundColor: '#fff', padding: 15, marginBottom: 10 },
  label: { fontSize: 12, color: '#7f8c8d', marginTop: 8 },
  value: { fontSize: 15, color: '#2c3e50', fontWeight: '600' },
  signatureContainer: { flex: 1, padding: 15, backgroundColor: '#fff', margin: 10, borderRadius: 10, minHeight: 350 },
  buttonRow: { flexDirection: 'row', padding: 15, gap: 10 },
  clearBtn: { flex: 1, backgroundColor: '#e74c3c', padding: 14, borderRadius: 10, alignItems: 'center' },
  clearText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
