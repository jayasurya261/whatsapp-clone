import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import NotFound from './pages/NotFound';

import { ChatProvider, useChat } from './context/ChatContext';

import { Toaster } from 'react-hot-toast';

const AppRoutes = () => {
  const { user } = useChat();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/chat" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to="/chat" replace /> : <Register />} 
      />
      <Route 
        path="/chat" 
        element={user ? <Chat /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/" 
        element={<Navigate to={user ? "/chat" : "/login"} replace />} 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <ChatProvider>
        <Toaster position="top-center" reverseOrder={false} />
        <AppRoutes />
      </ChatProvider>
    </Router>
  );
}

export default App;
