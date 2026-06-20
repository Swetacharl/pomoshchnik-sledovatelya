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
  
  // ✅ ИСПРАВЛЕНИЕ 1: Используем toBase64String вместо toBlob
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
