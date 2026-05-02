import React, { useRef, useEffect } from 'react';
import { Loader2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../../../context/ChatContext';
import MessageItem from '../Message/MessageItem';
import { getMessageGroupDate } from '../../../utils/dateUtils';

const MessageList = ({ 
  loading, 
  messageSearchQuery, 
  selectedDate, 
  onScroll, 
  showScrollButton, 
  scrollToBottom,
  ...messageItemProps 
}) => {
  const { messages } = useChat();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const groupedMessages = messages
    .filter(msg => {
      const matchesText = msg.content.toLowerCase().includes(messageSearchQuery.toLowerCase());
      const matchesDate = selectedDate ? new Date(msg.createdAt).toDateString() === selectedDate.toDateString() : true;
      return matchesText && matchesDate;
    })
    .reduce((groups, message) => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(message);
      return groups;
    }, {});

  return (
    <div 
      className="flex-1 overflow-y-auto px-10 py-4 z-10 custom-scrollbar flex flex-col gap-2 relative"
      onScroll={onScroll}
    >
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#00a884]" />
        </div>
      ) : (
        Object.entries(groupedMessages).map(([dateStr, dayMessages]) => (
          <div key={dateStr} className="flex flex-col gap-2">
            <div className="flex justify-center my-4 sticky top-0 z-20">
              <span className="bg-[#f0f2f5] px-3 py-1.5 rounded-lg shadow-sm text-[12px] text-[#54656f] font-medium uppercase tracking-wide border border-[#e9edef]">
                {getMessageGroupDate(dateStr)}
              </span>
            </div>
            {dayMessages.map((msg) => (
              <MessageItem 
                key={msg._id} 
                msg={msg} 
                searchQuery={messageSearchQuery}
                {...messageItemProps} 
              />
            ))}
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
      
      <AnimatePresence>
        {showScrollButton && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToBottom}
            className="sticky bottom-4 right-4 self-end bg-white w-[54px] h-[32px] rounded-full shadow-lg flex items-center justify-center cursor-pointer text-[#54656f] hover:bg-[#f8f9fa] z-30 border border-[#e9edef] transition-colors"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessageList;
