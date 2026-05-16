# Kizola Protect - Phone Authentication

This repository implements a professional, secure phone authentication system using React Native (Expo), Supabase Auth, and Twilio Verify.

## Architecture

The system uses a custom backend to securely handle Twilio API credentials and verification logic, never exposing them to the frontend.

### Components

1.  **Frontend (Expo/React Native)**
    *   **UI:** Modern, responsive screens in `app/(auth)/login.tsx` and `app/(auth)/verify.tsx`.
    *   **Components:** `PhoneInput` (with country code picker) and `OtpInput` (with auto-focus and auto-paste).
    *   **State Management:** Zustand (`store/authStore.ts`) handles state across the login flow and persists the pending phone number using `expo-secure-store` in case of app reload.
    *   **Services:** `services/auth/phoneAuthService.ts` communicates with the custom backend and handles the final Supabase session exchange.

2.  **Backend (Node.js/Express)**
    *   Located in the `/backend` directory.
    *   **Rate Limiting:** Protects Twilio API from abuse.
    *   **Twilio Verify:** Sends and checks 6-digit OTPs via SMS. No codes are stored in our database.
    *   **Supabase Admin:** Uses the `SERVICE_ROLE_KEY` to securely get or create a user by their verified phone number and generates a `magiclink` session token to pass back to the frontend.

## How the Flow Works

1.  **Send OTP:** User enters phone number on the frontend. The app calls `POST /auth/send-code` on the backend. The backend validates the number and calls Twilio Verify to send the SMS.
2.  **Verify OTP:** User enters the 6-digit code. The app calls `POST /auth/verify-code` with the phone and code. The backend verifies the code with Twilio.
3.  **Session Generation:** If the code is valid, the backend uses Supabase Admin to find or create the user and generates a session token. It returns this token to the frontend.
4.  **Sign In:** The frontend receives the session token and exchanges it directly with Supabase (`supabase.auth.verifyOtp({ token, type: 'magiclink' })`) to establish a persistent session on the device.

## Setup Instructions

### 1. Environment Variables

**Frontend (`.env.local`):**
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# Use your computer's local IP address when testing on a physical device
EXPO_PUBLIC_API_URL=http://localhost:3000
```

**Backend (`backend/.env`):**
```env
PORT=3000
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_VERIFY_SERVICE_SID=your_twilio_verify_service_sid
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. Running the Backend

```bash
cd backend
npm install
npm run dev
```

### 3. Running the Frontend

In a new terminal:
```bash
npm install
npm start
```
