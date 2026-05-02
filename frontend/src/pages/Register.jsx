import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, UserPlus, MessageSquare, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      navigate('/chat');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const { data } = await axios.post(
        'http://localhost:5000/api/auth/register',
        { name, username, email, password },
        config
      );

      localStorage.setItem('userInfo', JSON.stringify(data));
      setLoading(false);
      navigate('/chat');
    } catch (err) {
      setLoading(false);
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-start pt-12 sm:pt-20">
      {/* Header Logo Area */}
      <div className="flex items-center gap-3 mb-12">
        <div className="bg-[#25D366] p-2 rounded-xl shadow-lg">
          <MessageSquare className="text-white w-8 h-8 fill-current" />
        </div>
        <h1 className="text-2xl font-bold text-[#41525d] tracking-tight">WHATSAPP CLONE</h1>
      </div>

      {/* Register Card */}
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-sm border-t-4 border-[#00a884]">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[#3b4a54] mb-2">Create Account</h2>
          <p className="text-sm text-[#667781]">Join us to start chatting with your friends.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#3b4a54] ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8696a0]" />
              <input
                type="text"
                required
                className="w-full pl-11 pr-4 py-3 bg-[#f8f9fa] border border-[#e9edef] rounded-lg focus:outline-none focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884] transition-all text-[#3b4a54]"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#3b4a54] ml-1">Username (for invitations)</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8696a0]" />
              <input
                type="text"
                required
                className="w-full pl-11 pr-4 py-3 bg-[#f8f9fa] border border-[#e9edef] rounded-lg focus:outline-none focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884] transition-all text-[#3b4a54]"
                placeholder="johndoe123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#3b4a54] ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8696a0]" />
              <input
                type="email"
                required
                className="w-full pl-11 pr-4 py-3 bg-[#f8f9fa] border border-[#e9edef] rounded-lg focus:outline-none focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884] transition-all text-[#3b4a54]"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#3b4a54] ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8696a0]" />
              <input
                type="password"
                required
                className="w-full pl-11 pr-4 py-3 bg-[#f8f9fa] border border-[#e9edef] rounded-lg focus:outline-none focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884] transition-all text-[#3b4a54]"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#00a884] hover:bg-[#008f6f] text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <UserPlus className="w-5 h-5" />
            )}
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-[#667781]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#00a884] font-semibold hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>

      {/* Footer Decoration */}
      <div className="mt-12 text-[#8696a0] text-xs flex flex-col items-center gap-1 opacity-60">
        <p>End-to-end encrypted</p>
      </div>
    </div>
  );
};

export default Register;
