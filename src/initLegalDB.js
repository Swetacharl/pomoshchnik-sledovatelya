import * as SQLite from 'expo-sqlite';

// Загружаем ваш файл
const lawsData = require('../assets/laws.json');
const db = SQLite.openDatabaseSync('laws.db');

export async function initLegalDB() {
  // 1. Создаем таблицу, если её нет
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS laws (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL,
      article TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      search_tags TEXT
    );
  `);

  // 2. Считаем, сколько статей сейчас в базе
  const count = await db.getFirstAsync("SELECT COUNT(*) as c FROM laws");
  const currentCount = count ? count.c : 0;

  // 3. ГЛАВНОЕ: Если количество статей в базе НЕ совпадает с laws.json — стираем всё и загружаем заново!
  if (currentCount !== lawsData.length) {
    console.log(`🔄 Несоответствие: в базе ${currentCount}, в файле ${lawsData.length}. Обновляем...`);
    
    await db.execAsync(`DELETE FROM laws`); // Очищаем таблицу
    
    const insertStmt = await db.prepareAsync(
      "INSERT INTO laws (code, article, title, content, search_tags) VALUES (?, ?, ?, ?, ?)"
    );

    for (const law of lawsData) {
      await insertStmt.executeAsync([
        law.code || '',
        law.article || '',
        law.title || '',
        law.content || '',
        law.tags || ''
      ]);
    }
    await insertStmt.finalizeAsync();
    console.log(`✅ УСПЕХ! Загружено статей: ${lawsData.length}`);
  } else {
    console.log(`✅ База актуальна (${currentCount} статей)`);
  }
}

export default db;
