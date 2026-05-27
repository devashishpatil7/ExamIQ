# How to Run ExamIQ Locally

## Prerequisites
- Node.js v18 or higher → https://nodejs.org (download LTS)

## Steps

### 1. Install dependencies
```
npm install
```

### 2. Create .env file
```
cp .env.example .env
```
You can leave VITE_GEMINI_API_KEY blank for now — the app will run, but AI features will show a message asking for the key.

### 3. Run the app
```
npm run dev
```

### 4. Open browser
http://localhost:5173

## Notes
- Login with any name/email (auth is local only, no real backend auth)
- AI features (Generate, AI Chat) need a Gemini API key to work
- All other features (dashboard, analytics, study materials) work without any key
