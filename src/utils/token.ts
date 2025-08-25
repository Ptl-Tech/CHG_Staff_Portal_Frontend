export function getPersistedTokens() {
  try {
    const root = JSON.parse(localStorage.getItem('persist:root') || '{}');
    const auth = JSON.parse(root.auth || '{}');
    return {
      token: auth.token ?? '',
      bcToken: auth.bcToken ?? '',
    };
  } catch (error) {
    console.error('Failed to parse persisted tokens:', error);
    return { token: '', bcToken: '' };
  }
}
