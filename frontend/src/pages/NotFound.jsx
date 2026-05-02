import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Home, AlertCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-3 mb-12">
        <div className="bg-[#25D366] p-2 rounded-xl shadow-lg">
          <MessageSquare className="text-white w-8 h-8 fill-current" />
        </div>
        <h1 className="text-2xl font-bold text-[#41525d] tracking-tight">WHATSAPP CLONE</h1>
      </div>

      <div className="bg-white p-10 rounded-lg shadow-sm border-t-4 border-[#00a884] max-w-md w-full text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-[#8696a0]" />
        </div>
        
        <h2 className="text-3xl font-bold text-[#3b4a54] mb-4">404</h2>
        <h3 className="text-xl font-semibold text-[#3b4a54] mb-2">Page Not Found</h3>
        <p className="text-[#667781] mb-8">
          The link you followed may be broken, or the page may have been removed.
        </p>

        <Link 
          to="/" 
          className="bg-[#00a884] hover:bg-[#008f6f] text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 w-full"
        >
          <Home className="w-5 h-5" />
          Back to Home
        </Link>
      </div>

      <div className="mt-12 text-[#8696a0] text-xs flex flex-col items-center gap-1 opacity-60">
        <p>End-to-end encrypted</p>
      </div>
    </div>
  );
};

export default NotFound;
