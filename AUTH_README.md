# Kizola Protect — Authentication

Authentication system using **phone (OTP via Twilio Verify)**, **Google Login**, and **Apple Login** — all backed by Supabase Auth.

---

## Auth Methods

| Method | Status | Dependencies |
|--------|--------|-------------|
| Phone OTP (Twilio Verify) | ✅ Live | Twilio Verify Service, custom backend |
| Google Login | ✅ Live | `expo-auth-session`, Google Cloud Console |
| Apple Login | ✅ Live | `expo-apple-authentication`, Apple Developer |

---

## 1. Phone Authentication (OTP)

### Architecture

Custom backend handles Twilio credentials server-side — never exposed to the frontend.

### Components

1.  **Frontend (Expo/React Native)**
    *   **UI:** Screens in `app/(auth)/login.tsx` and `app/(auth)/verify.tsx`.
    *   **Components:** `PhoneInput` (country code picker), `OtpInput` (auto-focus, auto-paste).
    *   **State:** Zustand (`store/authStore.ts`) persists pending phone via `expo-secure-store`.
    *   **Service:** `services/auth/phoneAuthService.ts` communicates with backend + Supabase.

2.  **Backend (Node.js/Express)**
    *   Located in `/backend`.
    *   **Rate Limiting:** Protects Twilio API from abuse.
    *   **Twilio Verify:** Sends/checks 6-digit OTPs via SMS. No codes stored in our database.
    *   **Supabase Admin:** Uses `SERVICE_ROLE_KEY` to get/create user by verified phone, returns `magiclink` session token.

### Flow

1. User enters phone → `POST /auth/send-code` → Twilio sends SMS
2. User enters code → `POST /auth/verify-code` → Twilio verifies
3. Backend creates/gets Supabase user → returns session token
4. Frontend calls `supabase.auth.verifyOtp({ token, type: 'magiclink' })` → persistent session

---

## 2. Google Login

### Setup

1. Create project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Google Sign-In** API
3. Configure OAuth consent screen (external)
4. Create OAuth 2.0 credentials (iOS + Android + Web)

### Environment Variables

```env
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_android_client_id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_ios_client_id
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id
```

### Integration

- Uses `expo-auth-session` with Google provider
- Token exchanged via Supabase: `supabase.auth.signInWithIdToken({ provider: 'google', token })`
- Implementation in `services/auth/socialAuthService.ts`
- Callback route configured via Expo Router

---

## 3. Apple Login

### Setup

1. Enable **Sign In with Apple** in [Apple Developer Portal](https://developer.apple.com/)
2. Add `com.apple.developer.applesignin` entitlement in `app.json`

### Environment Variables

```env
EXPO_PUBLIC_APPLE_CLIENT_ID=com.your.bundle.id
EXPO_PUBLIC_APPLE_REDIRECT_URL=https://your-project.supabase.co/auth/v1/callback
```

### Integration

- Uses `expo-apple-authentication` for native modal
- Token exchanged via Supabase: `supabase.auth.signInWithIdToken({ provider: 'apple', token })`
- Implementation in `services/auth/socialAuthService.ts`

---

## Environment Variables

### Frontend (`.env.local`)
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_android_client_id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_ios_client_id
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id
EXPO_PUBLIC_APPLE_CLIENT_ID=com.your.bundle.id
EXPO_PUBLIC_APPLE_REDIRECT_URL=https://your-project.supabase.co/auth/v1/callback
```

### Backend (`backend/.env`)
```env
PORT=3000
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_VERIFY_SERVICE_SID=your_twilio_verify_service_sid
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Running

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
npm install
npm start
```
