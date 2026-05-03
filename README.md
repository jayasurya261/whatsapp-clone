# WhatsApp Web Clone

A simplified full-stack WhatsApp Web clone built with React, Node.js, and MongoDB. This project demonstrates core messaging functionality, real-time updates with Socket.io, and a modern responsive UI.

## 🚀 Features

- **End-to-End Encryption (E2EE)**: All messages are encrypted on the client-side using AES before being sent to the server. The database only stores encrypted blobs.
- **Route Protection**: Automated redirection for unauthenticated users and session persistence logic.
- **Authentication**: Secure Login/Register system with JWT.
- **Real-Time Messaging**: Instant message delivery and status updates using Socket.io.
- **Two-Panel Layout**: Responsive sidebar for chats and a dedicated chat window.
- **Advanced Search**: 
  - Search users to start new conversations.
  - Search messages within a specific chat by keyword.
  - **Date Filter**: Interactive calendar to find messages from specific dates.
- **Message Management**:
  - Delete any message (Optimistic updates).
  - Clear entire chat history.
  - Delete conversations.
- **Responsive Design**: Optimized for both Desktop and Mobile views.
- **Rich UI**: Context menus, optimistic updates, and smooth animations with Framer Motion.
- **Toast Notifications**: Professional feedback for user actions.

## 🛠️ Technology Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Lucide React, Framer Motion, React Hot Toast, **Crypto-JS**.
- **Backend**: Node.js, Express.js, Socket.io.
- **Database**: MongoDB (Mongoose).
- **Authentication**: JSON Web Tokens (JWT).

## 📋 Prerequisites

- Node.js installed on your machine.
- MongoDB instance (Local or Atlas).

## ⚙️ Setup Instructions

### 1. Backend Setup
1. Navigate to the `backend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder with the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` folder:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_SOCKET_ENDPOINT=http://localhost:5000
   VITE_E2EE_SECRET=your_custom_secret_key
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

## 📂 Project Structure

```text
whatsapp-clone/
├── backend/            # Express.js Server
│   ├── middleware/     # Auth & Error middlewares
│   ├── models/         # Mongoose Schemas
│   ├── routes/         # API Endpoints
│   └── index.js        # Server Entry Point
├── frontend/           # React Application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # Global State (ChatContext)
│   │   ├── hooks/      # Custom Hooks (useSocket)
│   │   ├── pages/      # Main Pages (Chat, Login, Register)
│   │   └── services/   # API Services (Axios)
│   └── App.jsx         # Main App Component
└── README.md
```

---
