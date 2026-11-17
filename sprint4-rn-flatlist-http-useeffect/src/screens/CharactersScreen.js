import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { COLORS, DEBOUNCE_MS } from '../config/constants';
import { getCharacters } from '../services/charactersService';
import CharacterCard from '../components/CharacterCard';
import StateMessage from '../components/StateMessage';

// Separador definido fuera de la pantalla para no recrearlo en cada render.
const ItemSeparator = () => <View style={styles.separator} />;

export default function CharactersScreen() {
  // Paso 3: estados principales de la pantalla.
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Paso 6: cambiar este contador permite volver a ejecutar la carga inicial.
  const [retryCount, setRetryCount] = useState(0);

  // Paso 8: estados para la paginación.
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingMoreRef = useRef(false);

  // Paso 9: estado independiente para pull to refresh.
  const [refreshing, setRefreshing] = useState(false);

  // Paso 10: texto escrito y texto que ya pasó el debounce.
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Identifica la petición vigente para ignorar respuestas antiguas.
  const requestIdRef = useRef(0);

  // Paso 10: espera antes de actualizar el término de búsqueda.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText.trim());
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchText]);

  // Pasos 4 y 6: carga inicial, reinicio por búsqueda y reintento.
  useEffect(() => {
    let isActive = true;
    const requestId = ++requestIdRef.current;

    async function loadInitialCharacters() {
      setLoading(true);
      setError(null);
      setCharacters([]);
      setPage(1);
      setHasNextPage(false);

      try {
        const data = await getCharacters({ page: 1, name: debouncedSearch });

        if (isActive && requestId === requestIdRef.current) {
          setCharacters(data.results);
          setPage(1);
          setHasNextPage(data.hasNextPage);
        }
      } catch (err) {
        if (isActive && requestId === requestIdRef.current) {
          setError(err.message || 'No fue posible cargar los personajes.');
        }
      } finally {
        if (isActive && requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }

    loadInitialCharacters();

    return () => {
      isActive = false;
    };
  }, [debouncedSearch, retryCount]);

  // Paso 8: solicita la página siguiente y conserva los personajes existentes.
  const loadMoreCharacters = useCallback(async () => {
    if (
      loading ||
      refreshing ||
      loadingMoreRef.current ||
      !hasNextPage
    ) {
      return;
    }

    loadingMoreRef.current = true;
    setLoadingMore(true);
    setError(null);

    const nextPage = page + 1;
    const requestId = requestIdRef.current;

    try {
      const data = await getCharacters({
        page: nextPage,
        name: debouncedSearch,
      });

      if (requestId === requestIdRef.current) {
        setCharacters((currentCharacters) => {
          const existingIds = new Set(currentCharacters.map((item) => item.id));
          const newCharacters = data.results.filter(
            (item) => !existingIds.has(item.id)
          );
          return [...currentCharacters, ...newCharacters];
        });
        setPage(nextPage);
        setHasNextPage(data.hasNextPage);
      }
    } catch (err) {
      if (requestId === requestIdRef.current) {
        setError(err.message || 'No fue posible cargar más personajes.');
      }
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [loading, refreshing, hasNextPage, page, debouncedSearch]);

  // Paso 9: vuelve a solicitar la primera página y reemplaza la lista.
  const refreshCharacters = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setRefreshing(true);
    setError(null);

    try {
      const data = await getCharacters({
        page: 1,
        name: debouncedSearch,
      });

      if (requestId === requestIdRef.current) {
        setCharacters(data.results);
        setPage(1);
        setHasNextPage(data.hasNextPage);
      }
    } catch (err) {
      if (requestId === requestIdRef.current) {
        setError(err.message || 'No fue posible actualizar los personajes.');
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setRefreshing(false);
      }
    }
  }, [debouncedSearch]);

  // Paso 7: mensaje que aparece cuando la búsqueda no devuelve personajes.
  const renderEmptyList = () => (
    <StateMessage message="No se encontraron personajes." />
  );

  // Pasos 8 y 9: pie de lista para carga adicional o error de paginación.
  const renderFooter = () => {
    if (loadingMore) {
      return (
        <ActivityIndicator
          style={styles.footer}
          size="small"
          color={COLORS.primary}
        />
      );
    }

    if (error && characters.length > 0) {
      return <Text style={styles.footerError}>{error}</Text>;
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rick and Morty</Text>

      {/* Paso 10: permanece montado aunque cambie el contenido de la lista. */}
      <TextInput
        style={styles.input}
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Buscar personaje por nombre..."
        placeholderTextColor={COLORS.textMuted}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
      />

      {/* Paso 6: carga inicial y error sin personajes. */}
      {loading ? (
        <ActivityIndicator
          style={styles.loader}
          size="large"
          color={COLORS.primary}
        />
      ) : error && characters.length === 0 ? (
        <StateMessage
          message={error}
          actionLabel="Reintentar"
          onAction={() => setRetryCount((count) => count + 1)}
        />
      ) : (
        /* Pasos 5, 7, 8 y 9: lista, paginación y actualización. */
        <FlatList
          data={characters}
          renderItem={({ item }) => <CharacterCard character={item} />}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={ItemSeparator}
          ListEmptyComponent={renderEmptyList}
          onEndReached={loadMoreCharacters}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshing={refreshing}
          onRefresh={refreshCharacters}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
  },
  title: {
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 12,
  },
  input: {
    backgroundColor: COLORS.card,
    color: COLORS.text,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  loader: { marginTop: 40 },
  separator: { height: 10 },
  listContent: { paddingBottom: 24, flexGrow: 1 },
  footer: { marginVertical: 16 },
  footerError: {
    color: COLORS.danger,
    textAlign: 'center',
    marginVertical: 16,
  },
});
