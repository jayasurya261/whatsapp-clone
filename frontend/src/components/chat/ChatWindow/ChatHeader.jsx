import React from 'react';
import { Search, MoreVertical, Video, ChevronDown, X, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../../../context/ChatContext';
import Avatar from '../../ui/Avatar';
import IconButton from '../../ui/IconButton';
import { formatLastSeen } from '../../../utils/dateUtils';

const ChatHeader = ({ 
  onToggleLocalSearch, 
  showLocalSearch, 
  showMoreMenu,
  setShowMoreMenu,
  onClearChat,
  onDeleteChat,
  onBlockUser,
  showCallPrompt, 
  onToggleCallPrompt,
  onBack
}) => {
  const { selectedChat, user, userStatuses, typingUsers } = useChat();
  const otherUser = selectedChat?.users.find(u => u._id !== user._id);

  if (!selectedChat) return null;

  const getStatusText = () => {
    if (typingUsers[selectedChat._id]) return "typing...";
    
    const status = userStatuses[otherUser._id];
    if (status?.isOnline) return "online";
    
    // Fallback to initial otherUser data if status not in userStatuses yet
    if (otherUser.isOnline && !status) return "online";
    
    return formatLastSeen(status?.lastSeen || otherUser.lastSeen);
  };

  return (
    <div className="h-[60px] bg-[#f0f2f5] flex items-center justify-between px-2 md:px-4 z-50 border-b border-[#e9edef] relative">
      <div className="flex items-center gap-1 md:gap-3">
        <button 
          onClick={onBack}
          className="md:hidden p-2 hover:bg-[#e9edef] rounded-full transition-colors mr-1"
        >
          <ArrowLeft className="w-5 h-5 text-[#54656f]" />
        </button>
        <Avatar src={otherUser.avatar} name={otherUser.name} />
        <div className="flex flex-col">
          <h3 className="text-[15px] md:text-[16px] font-medium text-[#111b21] leading-tight truncate max-w-[120px] sm:max-w-none">{otherUser.name}</h3>
          <span className={`text-[11px] md:text-[12px] ${typingUsers[selectedChat._id] ? 'text-[#00a884] font-medium animate-pulse' : 'text-[#667781]'}`}>
            {getStatusText()}
          </span>
        </div>
      </div>
      <div className="flex gap-4 items-center">
        <div className="relative">
          <button 
            onClick={onToggleCallPrompt}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#d1d7db] transition-colors cursor-pointer ${showCallPrompt ? 'bg-[#e9edef]' : 'bg-[#f0f2f5] hover:bg-[#e9edef]'}`}
          >
            <Video className="w-4 h-4 text-[#54656f]" />
            <span className="text-sm font-medium text-[#54656f]">Call</span>
            <ChevronDown className={`w-4 h-4 text-[#54656f] transition-transform ${showCallPrompt ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showCallPrompt && (
              <>
                {/* Transparent Backdrop to close on click outside, but no blur/color */}
                <div className="fixed inset-0 z-40" onClick={onToggleCallPrompt}></div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-2 w-[420px] bg-white rounded-xl shadow-[0_4px_24px_rgba(11,20,26,0.15)] p-6 border border-[#e9edef] z-50 origin-top-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex flex-col gap-1 text-left">
                      <h3 className="text-[#111b21] font-semibold text-[16px] leading-tight">Make calls with the Windows app</h3>
                      <p className="text-[#667781] text-[13px] leading-normal">Download WhatsApp for Windows to start making calls.</p>
                    </div>
                    <button 
                      onClick={() => {
                        window.open("https://get.microsoft.com/installer/download/9NKSQGP7F2NH?cid=call_btn_modal", "_blank");
                        onToggleCallPrompt();
                      }}
                      className="bg-[#00a884] text-white font-semibold px-5 py-2 rounded-full text-xs hover:bg-[#06cf9c] shadow-sm transition-all active:scale-95 whitespace-nowrap cursor-pointer"
                    >
                      Get the app
                    </button>
                  </div>
                  <button 
                    className="absolute top-2 right-2 p-1 hover:bg-[#f0f2f5] rounded-full cursor-pointer transition-colors"
                    onClick={onToggleCallPrompt}
                  >
                    <X className="w-4 h-4 text-[#8696a0]" />
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        <div className="border-l border-[#d1d7db] h-6 mx-1"></div>
        <IconButton 
          icon={Search} 
          onClick={onToggleLocalSearch} 
          active={showLocalSearch}
        />
        <div className="relative">
          <IconButton 
            icon={MoreVertical} 
            onClick={() => setShowMoreMenu(!showMoreMenu)} 
            active={showMoreMenu}
          />
          {showMoreMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-[60] border border-[#e9edef]">
              <button 
                onClick={() => {
                  setShowMoreMenu(false);
                  onBlockUser();
                }} 
                className="w-full text-left px-4 py-2 text-sm text-[#111b21] hover:bg-[#f5f6f6] transition-colors"
              >
                Block user
              </button>
              <button 
                onClick={() => {
                  setShowMoreMenu(false);
                  onClearChat();
                }} 
                className="w-full text-left px-4 py-2 text-sm text-[#111b21] hover:bg-[#f5f6f6] transition-colors"
              >
                Clear chat
              </button>
              <button 
                onClick={() => {
                  setShowMoreMenu(false);
                  onDeleteChat();
                }} 
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
              >
                Delete chat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
