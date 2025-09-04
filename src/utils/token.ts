export function getPersistedTokens() {
  try {
    const root = JSON.parse(localStorage.getItem('persist:auth') || '{}');

    const auth = JSON.parse(root.auth || '{}');

    const login = auth.login || {};

    return {
      token: login.token ?? '',
      bcToken: login.bcToken ?? '',
    };
  } catch (error) {
    //console.error('Failed to parse persisted tokens:', error);
    return { token: '', bcToken: '' };
  }
}
