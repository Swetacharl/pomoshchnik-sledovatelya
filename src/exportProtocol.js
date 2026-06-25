// src/exportProtocol.js
import { Document, Packer, Paragraph, TextRun, AlignmentType, ImageRun, PageBreak } from 'docx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export async function exportProtocolToWord(protocolData, signatures = [], photos = []) {
  const children = [];

  // === ШАПКА ДОКУМЕНТА ===
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'ПРОТОКОЛ', bold: true, size: 32 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'осмотра места происшествия', bold: true, size: 28 })],
    }),
    new Paragraph({ children: [new TextRun({ text: ' ' })] }),
    new Paragraph({
      children: [
        new TextRun({ text: `№ ${protocolData.protocolNumber}`, bold: true }),
        new TextRun({ text: `                                         ${protocolData.dateTime}` }),
      ],
    }),
    new Paragraph({ children: [new TextRun({ text: ' ' })] }),
    new Paragraph({
      children: [new TextRun({ text: `г. ____________                                                                             ${protocolData.dateTime}`, size: 24 })],
    }),
    new Paragraph({ children: [new TextRun({ text: ' ' })] }),
  );

  // === ВСТУПИТЕЛЬНАЯ ЧАСТЬ ===
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Следователь ', bold: true }),
        new TextRun({ text: `(ФИО следователя) ` }),
        new TextRun({ text: 'в соответствии со ст. 164, 176-177 УПК РФ произвёл осмотр места происшествия по адресу: ' }),
        new TextRun({ text: protocolData.address, bold: true, underline: {} }),
        new TextRun({ text: '.' }),
      ],
    }),
    new Paragraph({ children: [new TextRun({ text: ' ' })] }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Повод к осмотру: ', bold: true }),
        new TextRun({ text: protocolData.reasonForCall || '___________' }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Заявитель: ', bold: true }),
        new TextRun({ text: protocolData.callerName || '___________' }),
      ],
    }),
    new Paragraph({ children: [new TextRun({ text: ' ' })] }),
  );

  // === ПОНЯТЫЕ ===
  if (protocolData.witnessesList && protocolData.witnessesList.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'В осмотре участвовали понятые:', bold: true, underline: {} })],
      }),
    );
    protocolData.witnessesList.forEach((w, i) => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `${i + 1}. ${w.fio}, проживающий: ${w.address}` })],
        }),
      );
    });
    children.push(new Paragraph({ children: [new TextRun({ text: ' ' })] }));
  }

  // === СПЕЦИАЛИСТЫ ===
  if (protocolData.specialistsList && protocolData.specialistsList.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'Специалисты:', bold: true, underline: {} })],
      }),
    );
    protocolData.specialistsList.forEach((s, i) => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `${i + 1}. ${s.name} (${s.role})` })],
        }),
      );
    });
    children.push(new Paragraph({ children: [new TextRun({ text: ' ' })] }));
  }

  // === ОЧЕВИДЦЫ ===
  if (protocolData.eyewitnessesList && protocolData.eyewitnessesList.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'Опрошены очевидцы:', bold: true, underline: {} })],
      }),
    );
    protocolData.eyewitnessesList.forEach((w, i) => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `${i + 1}. ${w.fio}, проживающий: ${w.address}` })],
        }),
      );
    });
    children.push(new Paragraph({ children: [new TextRun({ text: ' ' })] }));
  }

  // === ХОД ОСМОТРА ===
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'Ход осмотра:', bold: true, underline: {} })],
    }),
    new Paragraph({
      children: [new TextRun({ text: `Осмотр начат в ${protocolData.videoStartTime || '___:___'}` })],
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Обнаружены следующие следы и предметы:' })],
    }),
  );

  const foundTraces = protocolData.checklist?.filter(c => c.checked).map(c => c.name);
  if (foundTraces && foundTraces.length > 0) {
    foundTraces.forEach(trace => {
      children.push(new Paragraph({ children: [new TextRun({ text: `• ${trace}` })] }));
    });
  } else {
    children.push(new Paragraph({ children: [new TextRun({ text: 'Следы не обнаружены.' })] }));
  }

  children.push(new Paragraph({ children: [new TextRun({ text: ' ' })] }));

  // === ИЗЪЯТО ===
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Изъято: ', bold: true }),
        new TextRun({ text: protocolData.seizedItems || 'ничего не изъято' }),
      ],
    }),
    new Paragraph({ children: [new TextRun({ text: ' ' })] }),
  );

  // === ТЕХНИЧЕСКИЕ СРЕДСТВА ===
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Технические средства: ', bold: true }),
        new TextRun({ text: protocolData.technicalMeans || 'не применялись' }),
      ],
    }),
  );

  if (protocolData.videoRecording === 'Да') {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `Видеосъёмка: с ${protocolData.videoStartTime} до ${protocolData.videoEndTime}` }),
        ],
      }),
    );
  }

  children.push(new Paragraph({ children: [new TextRun({ text: ' ' })] }));

  // === ПОДПИСИ ===
  children.push(
    new Paragraph({ children: [new TextRun({ text: ' ' })] }),
    new Paragraph({ children: [new TextRun({ text: 'Перед прочтением показаний мне разъяснено право иметь своего адвоката.', italics: true })] }),
    new Paragraph({ children: [new TextRun({ text: ' ' })] }),
  );

  children.push(new Paragraph({ children: [new TextRun({ text: 'Подписи участников:', bold: true, underline: {} })] }));
  
  if (protocolData.witnessesList) {
    protocolData.witnessesList.forEach(w => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `Понятой ${w.fio} _________________ /подпись/` })],
        }),
      );
    });
  }

  children.push(
    new Paragraph({ children: [new TextRun({ text: ' ' })] }),
    new Paragraph({
      children: [new TextRun({ text: 'Следователь _________________ /_______________/' })],
    }),
    new Paragraph({ children: [new TextRun({ text: ' ' })] }),
  );

  // === ФОТО НА ПОСЛЕДНИХ СТРАНИЦАХ ===
  if (photos && photos.length > 0) {
    children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'ФОТОТАБЛИЦА', bold: true, size: 28 })],
      }),
      new Paragraph({ children: [new TextRun({ text: ' ' })] }),
    );

    for (let i = 0; i < photos.length; i++) {
      try {
        const photoUri = photos[i].uri;
        const base64 = await FileSystem.readAsStringAsync(photoUri, {
          encoding: 'base64',
        });
        
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new ImageRun({
                data: Buffer.from(base64, 'base64'),
                transformation: { width: 500, height: 400 },
                type: 'jpg',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: `Фото ${i + 1}`, italics: true, size: 20 })],
          }),
          new Paragraph({ children: [new TextRun({ text: ' ' })] }),
        );
      } catch (err) {
        console.error('Ошибка вставки фото:', err);
      }
    }
  }

  // === СОЗДАНИЕ ДОКУМЕНТА ===
  const doc = new Document({
    sections: [{ children }],
  });

  // ✅ ИСПРАВЛЕНИЕ: Используем toBase64String вместо toBlob
  const base64String = await Packer.toBase64String(doc);
  const fileUri = `${FileSystem.documentDirectory}protocol_${protocolData.protocolNumber}.docx`;
  
  await FileSystem.writeAsStringAsync(fileUri, base64String, {
    encoding: 'base64',
  });

  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    dialogTitle: 'Поделиться протоколом',
  });

  return fileUri;
}
