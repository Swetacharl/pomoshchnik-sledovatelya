// src/syncManager.js
import * as SQLite from 'expo-sqlite';
import * as Network from 'expo-network';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config/firebase';

const database = SQLite.openDatabaseSync('laws.db');

export async function initSyncTable() {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS pending_protocols (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      protocol_data TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      synced INTEGER DEFAULT 0
    );
  `);
}

export async function checkInternet() {
  try {
    const state = await Network.getNetworkStateAsync();
    return state.isConnected && state.isInternetReachable;
  } catch {
    return false;
  }
}

export async function saveProtocolLocally(protocolData) {
  await database.runAsync(
    'INSERT INTO pending_protocols (protocol_data, created_at) VALUES (?, ?)',
    [JSON.stringify(protocolData), Date.now()]
  );
}

export async function syncPendingProtocols() {
  const online = await checkInternet();
  if (!online) return { synced: 0 };

  const pending = await database.getAllAsync(
    'SELECT * FROM pending_protocols WHERE synced = 0 ORDER BY created_at ASC'
  );

  let synced = 0;
  for (const item of pending) {
    try {
      const data = JSON.parse(item.protocol_data);
      await addDoc(collection(db, 'protocols'), { ...data, createdAt: serverTimestamp() });
      await database.runAsync('UPDATE pending_protocols SET synced = 1 WHERE id = ?', [item.id]);
      synced++;
    } catch (e) {
      console.error('Sync error:', e);
    }
  }
  return { synced };
}

export async function getPendingCount() {
  try {
    const r = await database.getFirstAsync('SELECT COUNT(*) as c FROM pending_protocols WHERE synced = 0');
    return r?.c || 0;
  } catch {
    return 0;
  }
}
