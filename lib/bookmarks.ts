import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@kizola_bookmarked_articles';

export async function getBookmarks(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function addBookmark(articleId: string): Promise<string[]> {
  const bookmarks = await getBookmarks();
  if (bookmarks.includes(articleId)) return bookmarks;
  const next = [...bookmarks, articleId];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export async function removeBookmark(articleId: string): Promise<string[]> {
  const bookmarks = await getBookmarks();
  const next = bookmarks.filter((id) => id !== articleId);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export async function toggleBookmark(articleId: string): Promise<{
  bookmarked: boolean;
  bookmarks: string[];
}> {
  const bookmarks = await getBookmarks();
  if (bookmarks.includes(articleId)) {
    const next = bookmarks.filter((id) => id !== articleId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return { bookmarked: false, bookmarks: next };
  }
  const next = [...bookmarks, articleId];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return { bookmarked: true, bookmarks: next };
}

export async function isBookmarked(articleId: string): Promise<boolean> {
  const bookmarks = await getBookmarks();
  return bookmarks.includes(articleId);
}
