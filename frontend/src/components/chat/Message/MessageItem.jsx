import React from 'react';
import { ChevronDown, Reply, Copy, Forward, Trash2, Clock, CheckCheck, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../../../context/ChatContext';
import { formatMessageTime } from '../../../utils/dateUtils';

const MessageItem = ({ 
  msg, 
  onReply, 
  onDelete, 
  onCopy, 
  onScrollToMessage,
  activeMenuId,
  setActiveMenuId,
  menuPosition,
  handleOpenMenu,
  searchQuery
}) => {
  const { user } = useChat();
  const isUser = msg.sender._id === user._id;

  const renderStatusTicks = () => {
    if (msg.pending) return <Clock className="w-3 h-3 text-[#8696a0]" />;
    
    if (msg.isRead) {
      return <CheckCheck className="w-4 h-4 text-[#53bdeb]" />;
    }
    
    if (msg.isDelivered) {
      return <CheckCheck className="w-4 h-4 text-[#8696a0]" />;
    }
    
    return <Check className="w-4 h-4 text-[#8696a0]" />;
  };

  const renderContent = () => {
    if (!searchQuery) return msg.content;
    const parts = msg.content.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === searchQuery.toLowerCase() ? 
        <span key={i} className="bg-yellow-200 text-black">{part}</span> : part
    );
  };

  return (
    <div 
      id={`msg-${msg._id}`}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2 group relative`}
      onMouseLeave={() => setActiveMenuId(null)}
    >
      <div className={`max-w-[65%] px-3 py-2 rounded-lg shadow-sm relative ${isUser ? 'bg-[#d9fdd3] rounded-tr-none mr-2' : 'bg-white rounded-tl-none ml-2'}`}>
        {/* Message Tail */}
        <div className={`absolute top-0 w-2 h-2.5 ${isUser ? '-right-2 bg-[#d9fdd3] [clip-path:polygon(0_0,0_100%,100%_0)]' : '-left-2 bg-white [clip-path:polygon(100%_0,100%_100%,0_0)]'}`}></div>

        {/* Reply Context */}
        {msg.replyTo && (
          <div 
            onClick={() => onScrollToMessage(msg.replyTo._id)}
            className={`mb-1.5 p-2 rounded-md bg-black/5 border-l-[4px] ${isUser ? 'border-[#00a884]' : 'border-[#53bdeb]'} text-[13px] cursor-pointer hover:bg-black/10 transition-colors`}
          >
            <span className="font-semibold block text-[#00a884]">{msg.replyTo.sender.name === user.name ? 'You' : msg.replyTo.sender.name}</span>
            <span className="text-[#667781] line-clamp-1">{msg.replyTo.content}</span>
          </div>
        )}
        
        {/* Message Actions Trigger */}
        <div className={`absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 ${activeMenuId === msg._id ? 'opacity-100' : ''}`}>
          <button 
            onClick={(e) => handleOpenMenu(e, msg._id, isUser)}
            className="p-1 hover:bg-black/5 rounded-full text-[#8696a0] hover:text-[#111b21] transition-all"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Message Context Menu */}
        <AnimatePresence>
          {activeMenuId === msg._id && (
            <div className="fixed inset-0 z-[999]" onClick={() => setActiveMenuId(null)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -5 }}
                className="fixed w-[180px] bg-white rounded-lg shadow-[0_4px_20px_rgba(11,20,26,0.15)] py-2 border border-[#e9edef]"
                style={{ top: menuPosition.top, left: menuPosition.left }}
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={() => { onReply(msg); setActiveMenuId(null); }} className="w-full px-4 py-2 text-left text-[14.5px] hover:bg-[#f5f6f6] flex items-center gap-3 text-[#3b4a54]">
                  <Reply className="w-4 h-4 opacity-70" /> Reply
                </button>
                <button onClick={() => onCopy(msg.content)} className="w-full px-4 py-2 text-left text-[14.5px] hover:bg-[#f5f6f6] flex items-center gap-3 text-[#3b4a54]">
                  <Copy className="w-4 h-4 opacity-70" /> Copy
                </button>
                <button className="w-full px-4 py-2 text-left text-[14.5px] hover:bg-[#f5f6f6] flex items-center gap-3 text-[#3b4a54]">
                  <Forward className="w-4 h-4 opacity-70" /> Forward
                </button>
                <div className="border-t border-[#e9edef] my-1"></div>
                <button onClick={() => onDelete(msg._id)} className="w-full px-4 py-2 text-left text-[14.5px] hover:bg-[#f5f6f6] flex items-center gap-3 text-[#ea0038]">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="relative pr-6">
          <p className="text-[14.2px] text-[#111b21] whitespace-pre-wrap break-words pb-1">
            {renderContent()}
          </p>
          <div className="flex items-center justify-end gap-1">
            <span className="text-[11px] text-[#667781] uppercase">{formatMessageTime(msg.createdAt)}</span>
            {isUser && renderStatusTicks()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
