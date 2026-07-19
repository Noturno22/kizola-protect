# Kizola Protect — Authentication

Phone OTP (Twilio), Google Login, Apple Login — Supabase Auth backend.

## Métodos

| Método | Status | Stack |
|--------|--------|-------|
| Phone OTP | ✅ Live | Twilio Verify v2 + custom backend |
| Google Login | ✅ Live | expo-auth-session + Supabase |
| Apple Login | ✅ Live | expo-apple-authentication + Supabase |

## Phone OTP Flow

```
1. user → login-phone.tsx → POST /auth/send-code → Twilio SMS
2. user → verify.tsx → POST /auth/verify-code → Twilio verify
3. backend → Supabase getOrCreateUser → session tokens
4. frontend → supabase.auth.verifyOtp() → sessão persistente
```

**Componentes:** `PhoneInput`, `OtpInput`, `usePhoneAuth`, `phoneAuthService.ts`
**Backend:** `backend/src/controllers/authController.js` + `services/twilioService.js`
**Rate limiting:** 5 sends/10min, 10 verifies/10min

## Google/Apple Login

Ambos usam `expo-auth-session` / `expo-apple-authentication` → Supabase `signInWithIdToken()`.
Serviço: `services/auth/socialAuthService.ts`

## Env Variables

**Frontend (.env.local):**
```
EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY
EXPO_PUBLIC_API_URL, EXPO_PUBLIC_GOOGLE_CLIENT_ID/IOS/WEB
```

**Backend (backend/.env):**
```
PORT, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID
SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
```

## Running

```bash
cd backend && npm install && npm run dev  # Backend
npm install && npm start                   # Frontend
```
