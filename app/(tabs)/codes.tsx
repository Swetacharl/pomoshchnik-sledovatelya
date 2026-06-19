// app/(tabs)/codes.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import db from '../../src/initLegalDB';

export default function CodesScreen() {
  const [laws, setLaws] = useState([]);
  const [filteredLaws, setFilteredLaws] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCode, setSelectedCode] = useState('Все');
  const [loading, setLoading] = useState(true);

  // Загрузка всех законов из БД
  useEffect(() => {
    loadLaws();
  }, []);

  // Фильтрация при изменении поиска или фильтра
  useEffect(() => {
    filterLaws();
  }, [laws, searchQuery, selectedCode]);

  const loadLaws = async () => {
    try {
      const allLaws = await db.getAllAsync("SELECT * FROM laws ORDER BY code, article");
      setLaws(allLaws);
      setFilteredLaws(allLaws);
    } catch (error) {
      console.error('Ошибка загрузки законов:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLaws = () => {
    let filtered = laws;

    // Фильтр по кодексу
    if (selectedCode !== 'Все') {
      filtered = filtered.filter(law => law.code === selectedCode);
    }

    // Поиск по тексту
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(law => 
        law.title.toLowerCase().includes(query) ||
        law.article.toLowerCase().includes(query) ||
        law.content.toLowerCase().includes(query) ||
        law.search_tags.toLowerCase().includes(query)
      );
    }

    setFilteredLaws(filtered);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2980b9" />
        <Text style={styles.loadingText}>Загрузка базы законов...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Поиск */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск по статьям, номерам, ключевым словам..."
          placeholderTextColor="#95a5a6"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Фильтры по кодексам */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        {['Все', 'УК РФ', 'УПК РФ', 'КоАП РФ', 'ГК РФ'].map(code => (
          <TouchableOpacity
            key={code}
            style={[styles.filterBtn, selectedCode === code && styles.filterBtnActive]}
            onPress={() => setSelectedCode(code)}
          >
            <Text style={[styles.filterText, selectedCode === code && styles.filterTextActive]}>
              {code}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Результаты */}
      <ScrollView style={styles.resultsContainer}>
        {filteredLaws.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📖 Ничего не найдено</Text>
            <Text style={styles.emptySubtext}>Попробуйте изменить запрос или фильтр</Text>
          </View>
        ) : (
          <>
            <Text style={styles.resultsCount}>Найдено статей: {filteredLaws.length}</Text>
            {filteredLaws.map((law) => (
              <View key={law.id} style={styles.lawCard}>
                <View style={styles.lawHeader}>
                  <Text style={styles.lawCode}>{law.code}</Text>
                  <Text style={styles.lawArticle}>Ст. {law.article}</Text>
                </View>
                <Text style={styles.lawTitle}>{law.title}</Text>
                <Text style={styles.lawContent} numberOfLines={4}>
                  {law.content}
                </Text>
                {law.search_tags && (
                  <View style={styles.tagsContainer}>
                    <Text style={styles.tagsLabel}>Теги:</Text>
                    <Text style={styles.tagsText}>{law.search_tags}</Text>
                  </View>
                )}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#7f8c8d',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 15,
  },
  filtersContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ecf0f1',
    marginRight: 8,
  },
  filterBtnActive: {
    backgroundColor: '#2980b9',
  },
  filterText: {
    fontSize: 13,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  resultsContainer: {
    flex: 1,
    padding: 15,
  },
  resultsCount: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  lawCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  lawHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lawCode: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2980b9',
    backgroundColor: '#e8f4f8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  lawArticle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  lawTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  lawContent: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  tagsContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  tagsLabel: {
    fontSize: 11,
    color: '#95a5a6',
    marginBottom: 2,
  },
  tagsText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#95a5a6',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#bdc3c7',
  },
});
