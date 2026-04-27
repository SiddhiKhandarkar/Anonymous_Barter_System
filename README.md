# ShadowBarter 📦🕵️‍♂️

ShadowBarter is a privacy-first, anonymous barter platform designed for college environments. It promotes a circular economy by enabling students to exchange items securely and anonymously using a simulated locker system and a coin-based economy.

## 🚀 Key Features

- **Anonymous Authentication**: Peer-to-peer trust without personal data. Identities are auto-generated (e.g., `User_1024`).
- **Coin-Based Economy**: Start with 50 coins. Earn 7 for giving and spend 5 for taking.
- **AI-Assisted Safety**: Built-in moderation filter to block restricted items and automatic categorization of listings.
- **Simulated Locker Handoff**: Secure exchange via digital lockers with QR codes and OTP verification.
- **Smart Matching**: Intelligent suggestions based on your listings and interests.
- **Real-time Anonymous Chat**: Secure communication channel for every transaction.
- **Gamified Dashboard**: Track your credits, reputation (ratings), and active swaps.

## 🛠️ Technology Stack

- **Frontend**: React.js, Tailwind CSS (Circular Economy Palette), Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express.js, Socket.IO.
- **Database**: MongoDB (Mongoose).
- **Security**: JWT-based stateless authentication.

## 🎨 Color Palette (Circular Economy)

- **Primary**: #2D5A27 (Deep Forest)
- **Secondary**: #A7C957 (Fresh Leaf)
- **Community**: #BC4749 (Brick Red)
- **Background**: #F2E8CF (Parchment)
- **Text**: #1B3022 (Dark Moss)

## 🏁 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (Local or Atlas)

### 1. Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure `.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/shadowbarter
   JWT_SECRET=shadowbarter_secret_key
   FRONTEND_URL=http://localhost:5173
   ```
4. Start the server:
   ```bash
   npm start
   ```

### 2. Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 📐 Project Structure

```text
/server
  /models       - Mongoose schemas
  /controllers  - Business logic
  /routes       - API endpoints
  /services     - AI, Locker, Matching logic
  /middlewares  - Auth protection

/client
  /src/pages    - Dashboard, Home, Simulation, etc.
  /src/context  - Auth state management
  /src/components - Global UI elements
  /src/services - API config
```

## 🛡️ Safety First
ShadowBarter utilizes an AI Moderation layer that scans every listing. Items like weapons, drugs, or illegal substances are automatically flagged and rejected to ensure a safe community for all students.

## 👥 Creators
- **Siddhi Khandarkar**: 7756077312
- **Kadambari Marne**: 8263861829
