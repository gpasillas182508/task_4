import { API_BASE_URL } from '../config/constants';

// Contrato:
// getCharacters({ page, name }) → Promise<{ results, hasNextPage }>

export async function getCharacters({ page = 1, name = '' } = {}) {
  const trimmedName = name.trim();
  let url = `${API_BASE_URL}/character?page=${page}`;

  if (trimmedName) {
    url += `&name=${encodeURIComponent(trimmedName)}`;
  }

  const response = await fetch(url);

  // La API responde 404 cuando una búsqueda no encuentra coincidencias.
  if (response.status === 404 && trimmedName) {
    return { results: [], hasNextPage: false };
  }

  if (!response.ok) {
    throw new Error(`Error al consultar los personajes (HTTP ${response.status}).`);
  }

  const data = await response.json();

  return {
    results: data.results ?? [],
    hasNextPage: Boolean(data.info?.next),
  };
}
