import * as SecureStore from 'expo-secure-store';
import {
  getSecureItem,
  setSecureItem,
  removeSecureItem,
  clearAllSecure,
  setTokens,
  getTokens,
  clearAuthTokens,
  setUserPII,
  getUserPII,
  clearUserPII,
  SECURE_KEYS,
} from '@/lib/secureStorage';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WhenUnlockedThisDeviceOnly',
}));

const mockGetItem = SecureStore.getItemAsync as jest.Mock;
const mockSetItem = SecureStore.setItemAsync as jest.Mock;
const mockDeleteItem = SecureStore.deleteItemAsync as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SECURE_KEYS', () => {
  it('has all required static keys', () => {
    expect(SECURE_KEYS.ACCESS_TOKEN).toBe('kizola_access_token');
    expect(SECURE_KEYS.REFRESH_TOKEN).toBe('kizola_refresh_token');
    expect(SECURE_KEYS.USER_PHONE).toBe('kizola_user_phone');
    expect(SECURE_KEYS.USER_EMAIL).toBe('kizola_user_email');
    expect(SECURE_KEYS.PENDING_PHONE).toBe('kizola_pending_phone');
    expect(SECURE_KEYS.MFA_FACTOR_ID).toBe('kizola_mfa_factor_id');
    expect(SECURE_KEYS.MFA_SECRET).toBe('kizola_mfa_secret');
    expect(SECURE_KEYS.DEMO_USER).toBe('kizola_demo_user');
    expect(SECURE_KEYS.PENDING_RECEIPT).toBe('kizola_pending_receipt');
  });

  it('has dynamic key factories returning scoped keys', () => {
    expect(SECURE_KEYS.BENEFICIARIES('u1')).toBe('kizola_beneficiaries_u1');
    expect(SECURE_KEYS.SUPPORT_REQUESTS('u2')).toBe('kizola_support_u2');
    expect(SECURE_KEYS.HOUSING_REQUESTS('u3')).toBe('kizola_housing_u3');
    expect(SECURE_KEYS.FINANCE_REQUESTS('u4')).toBe('kizola_finance_u4');
    expect(SECURE_KEYS.NOTIFICATIONS('u5')).toBe('kizola_notifications_u5');
    expect(SECURE_KEYS.DOCUMENTS('u6')).toBe('kizola_documents_u6');
    expect(SECURE_KEYS.ACTIVITIES('u7')).toBe('kizola_activities_u7');
  });
});

describe('getSecureItem', () => {
  it('returns null when key does not exist', async () => {
    mockGetItem.mockResolvedValue(null);
    const result = await getSecureItem('test_key');
    expect(result).toBeNull();
  });

  it('parses JSON values', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify({ foo: 'bar' }));
    const result = await getSecureItem<{ foo: string }>('test_key');
    expect(result).toEqual({ foo: 'bar' });
  });

  it('returns raw string when JSON parse fails', async () => {
    mockGetItem.mockResolvedValue('plainstring');
    const result = await getSecureItem('test_key');
    expect(result).toBe('plainstring');
  });

  it('returns null on error', async () => {
    mockGetItem.mockRejectedValue(new Error('store error'));
    const result = await getSecureItem('test_key');
    expect(result).toBeNull();
  });
});

describe('setSecureItem', () => {
  it('stores string values directly', async () => {
    await setSecureItem('test_key', 'hello');
    expect(mockSetItem).toHaveBeenCalledWith('test_key', 'hello', {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  });

  it('serializes non-string values to JSON', async () => {
    await setSecureItem('test_key', { a: 1 });
    expect(mockSetItem).toHaveBeenCalledWith('test_key', JSON.stringify({ a: 1 }), {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  });

  it('does not throw on error', async () => {
    mockSetItem.mockRejectedValue(new Error('store full'));
    await expect(setSecureItem('test_key', 'val')).resolves.toBeUndefined();
  });
});

describe('removeSecureItem', () => {
  it('calls deleteItemAsync with the key', async () => {
    await removeSecureItem('test_key');
    expect(mockDeleteItem).toHaveBeenCalledWith('test_key');
  });

  it('does not throw on error', async () => {
    mockDeleteItem.mockRejectedValue(new Error('not found'));
    await expect(removeSecureItem('test_key')).resolves.toBeUndefined();
  });
});

describe('clearAllSecure', () => {
  it('deletes all static keys', async () => {
    mockDeleteItem.mockResolvedValue(undefined);
    await clearAllSecure();
    const staticKeys = Object.values(SECURE_KEYS).filter(
      (v) => typeof v === 'string'
    );
    for (const key of staticKeys) {
      expect(mockDeleteItem).toHaveBeenCalledWith(key);
    }
  });
});

describe('setTokens / getTokens', () => {
  it('stores access and refresh tokens', async () => {
    mockSetItem.mockResolvedValue(undefined);
    await setTokens('at1', 'rt1');
    expect(mockSetItem).toHaveBeenCalledWith('kizola_access_token', 'at1', expect.anything());
    expect(mockSetItem).toHaveBeenCalledWith('kizola_refresh_token', 'rt1', expect.anything());
  });

  it('retrieves stored tokens', async () => {
    mockGetItem.mockImplementation((key: string) => {
      if (key === 'kizola_access_token') return Promise.resolve('at1');
      if (key === 'kizola_refresh_token') return Promise.resolve('rt1');
      return Promise.resolve(null);
    });
    const tokens = await getTokens();
    expect(tokens).toEqual({ accessToken: 'at1', refreshToken: 'rt1' });
  });
});

describe('clearAuthTokens', () => {
  it('deletes all auth-related keys', async () => {
    mockDeleteItem.mockResolvedValue(undefined);
    await clearAuthTokens();
    expect(mockDeleteItem).toHaveBeenCalledWith('kizola_access_token');
    expect(mockDeleteItem).toHaveBeenCalledWith('kizola_refresh_token');
    expect(mockDeleteItem).toHaveBeenCalledWith('kizola_mfa_factor_id');
    expect(mockDeleteItem).toHaveBeenCalledWith('kizola_last_activity');
    expect(mockDeleteItem).toHaveBeenCalledWith('kizola_login_attempts');
  });
});

describe('setUserPII / getUserPII', () => {
  it('stores phone and email', async () => {
    mockSetItem.mockResolvedValue(undefined);
    await setUserPII('+244900000000', 'user@example.com');
    expect(mockSetItem).toHaveBeenCalledWith('kizola_user_phone', '+244900000000', expect.anything());
    expect(mockSetItem).toHaveBeenCalledWith('kizola_user_email', 'user@example.com', expect.anything());
  });

  it('skips undefined fields', async () => {
    mockSetItem.mockResolvedValue(undefined);
    await setUserPII('+244900000000');
    expect(mockSetItem).toHaveBeenCalledWith('kizola_user_phone', '+244900000000', expect.anything());
    expect(mockSetItem).not.toHaveBeenCalledWith('kizola_user_email', expect.anything());
  });

  it('retrieves stored PII', async () => {
    mockGetItem.mockImplementation((key: string) => {
      if (key === 'kizola_user_phone') return Promise.resolve('+244900000000');
      if (key === 'kizola_user_email') return Promise.resolve('user@example.com');
      return Promise.resolve(null);
    });
    const pii = await getUserPII();
    expect(pii).toEqual({ phone: '+244900000000', email: 'user@example.com' });
  });
});

describe('clearUserPII', () => {
  it('deletes all PII-related keys', async () => {
    mockDeleteItem.mockResolvedValue(undefined);
    await clearUserPII();
    expect(mockDeleteItem).toHaveBeenCalledWith('kizola_user_phone');
    expect(mockDeleteItem).toHaveBeenCalledWith('kizola_user_email');
    expect(mockDeleteItem).toHaveBeenCalledWith('kizola_pending_phone');
    expect(mockDeleteItem).toHaveBeenCalledWith('kizola_pending_receipt');
  });
});
