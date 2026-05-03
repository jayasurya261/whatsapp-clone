import React, { useState, useRef } from 'react';
import { Smile, Send, X } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../../../context/ChatContext';

const MessageInput = ({ onSendMessage, replyingTo, setReplyingTo }) => {
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typing, setTyping] = useState(false);
  const lastTypingTimeRef = useRef();
  const { user, socket, selectedChat } = useChat();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    if (socket && selectedChat) {
      socket.emit("stop typing", selectedChat);
    }
    
    onSendMessage(newMessage);
    setNewMessage('');
    setTyping(false);
    setShowEmojiPicker(false);
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (showEmojiPicker) setShowEmojiPicker(false);

    if (!socket || !selectedChat) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat);
    }

    lastTypingTimeRef.current = new Date().getTime();
    const timerLength = 3000;

    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTimeRef.current;

      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat);
        setTyping(false);
      }
    }, timerLength);
  };

  const onEmojiClick = (emojiData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="bg-[#f0f2f5] px-4 py-2 z-10 flex flex-col relative">
      {showEmojiPicker && (
        <div className="absolute bottom-[60px] left-4 z-50 shadow-2xl">
          <EmojiPicker 
            onEmojiClick={onEmojiClick} 
            width={350} 
            height={400} 
            searchDisabled={true}
            skinTonesDisabled={true}
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}

      {/* Reply Preview */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="w-full bg-[#f0f2f5] pb-2 flex flex-col relative"
          >
            <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-[#e9edef] flex flex-col gap-1 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#00a884]"></div>
              <div className="flex justify-between items-start">
                <span className="text-[#00a884] font-semibold text-sm">
                  {replyingTo.sender._id === user._id ? 'You' : replyingTo.sender.name}
                </span>
                <X className="w-4 h-4 text-[#8696a0] cursor-pointer hover:text-[#111b21]" onClick={() => setReplyingTo(null)} />
              </div>
              <p className="text-[#667781] text-sm line-clamp-1">{replyingTo.content}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-4">
        <Smile 
          className={`w-6 h-6 cursor-pointer ${showEmojiPicker ? 'text-[#00a884]' : 'text-[#54656f]'} hover:text-[#111b21]`} 
          onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
        />
        <form onSubmit={handleSubmit} className="flex-1">
          <input 
            type="text" 
            placeholder="Type a message" 
            className="w-full bg-white border-none outline-none px-4 py-2.5 rounded-lg text-[15px] text-[#3b4a54] shadow-sm"
            value={newMessage}
            onChange={handleTyping}
          />
        </form>
        <div 
          onClick={handleSubmit}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${newMessage.trim() ? 'bg-[#00a884] text-white shadow-md scale-110' : 'text-[#8696a0]'}`}
        >
          <Send className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
