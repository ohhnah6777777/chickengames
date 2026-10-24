export function canAccessSource(source: '3kh0' | 'lumin', userId: string | null) {
  return source === '3kh0' || Boolean(userId);
}