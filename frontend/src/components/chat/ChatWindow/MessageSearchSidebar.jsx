import React, { useState, useMemo } from 'react';
import { X, Search, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../../../context/ChatContext';
import { formatMessageTime } from '../../../utils/dateUtils';

const MessageSearchSidebar = ({ onClose, query, onChange, chatName, selectedDate, setSelectedDate }) => {
  const { messages } = useChat();
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const filteredMessages = useMemo(() => {
    if (!query && !selectedDate) return [];

    return messages.filter(msg => {
      const msgDate = new Date(msg.createdAt);
      
      const matchesQuery = !query || msg.content.toLowerCase().includes(query.toLowerCase());
      
      const matchesDate = !selectedDate || (
        msgDate.getDate() === selectedDate.getDate() &&
        msgDate.getMonth() === selectedDate.getMonth() &&
        msgDate.getFullYear() === selectedDate.getFullYear()
      );

      return matchesQuery && matchesDate;
    }).reverse(); // Latest first in results
  }, [messages, query, selectedDate]);

  const handleDateClick = (year, month, day, isFuture, current) => {
    if (isFuture || !current) return;
    const date = new Date(year, month, day);
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const prevMonthDays = getDaysInMonth(year, month - 1);
    const prevMonthFill = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      prevMonthFill.push({ day: prevMonthDays - i, current: false });
    }

    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isFuture = date > today;
      currentMonthDays.push({ day: i, current: true, isFuture });
    }

    const allDays = [...prevMonthFill, ...currentMonthDays];
    const remaining = 42 - allDays.length;
    for (let i = 1; i <= remaining; i++) {
      allDays.push({ day: i, current: false });
    }

    return (
      <div className="grid grid-cols-7 gap-1 text-center text-[13px]">
        {days.map(d => (
          <div key={d} className="text-[#667781] py-2 font-medium">{d}</div>
        ))}
        {allDays.map((item, idx) => {
          const isSelected = selectedDate && 
                             item.day === selectedDate.getDate() && 
                             month === selectedDate.getMonth() && 
                             year === selectedDate.getFullYear() && 
                             item.current;
          const isToday = item.day === today.getDate() && 
                          month === today.getMonth() && 
                          year === today.getFullYear() && 
                          item.current;

          return (
            <div 
              key={idx} 
              onClick={() => handleDateClick(year, month, item.day, item.isFuture, item.current)}
              className={`
                py-2 rounded-full cursor-pointer transition-colors relative
                ${item.current ? 'text-[#111b21]' : 'text-[#8696a0] opacity-50'}
                ${item.isFuture ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#f0f2f5]'}
                ${isSelected ? 'bg-[#00a884] text-white hover:bg-[#00a884]' : ''}
                ${isToday && !isSelected ? 'text-[#00a884] font-bold' : ''}
              `}
            >
              {item.day}
              {isToday && !isSelected && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#00a884] rounded-full"></div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="w-[400px] bg-white border-l border-[#e9edef] flex flex-col h-full z-50 shadow-[-2px_0_5px_rgba(0,0,0,0.05)]"
    >
      {/* Header */}
      <div className="h-[60px] bg-[#f0f2f5] flex items-center px-6 gap-6">
        <X className="w-6 h-6 text-[#54656f] cursor-pointer" onClick={onClose} />
        <h2 className="text-[16px] font-medium text-[#111b21]">Search messages</h2>
      </div>

      {/* Search Input Area */}
      <div className="p-4 bg-white border-b border-[#e9edef] relative">
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-[#f0f2f5] flex items-center px-4 py-2 rounded-lg group border border-transparent focus-within:border-[#00a884] focus-within:bg-white transition-all">
            <Search className="w-5 h-5 text-[#8696a0] group-focus-within:text-[#00a884]" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none outline-none w-full px-4 text-sm text-[#3b4a54]"
              value={query}
              onChange={(e) => onChange(e.target.value)}
              autoFocus
            />
          </div>
          
          <div className="relative">
            <CalendarIcon 
              className={`w-6 h-6 cursor-pointer transition-colors p-1 rounded-full ${showCalendar ? 'text-[#00a884] bg-[#f0f2f5]' : 'text-[#54656f] hover:bg-[#f0f2f5]'}`}
              onClick={() => setShowCalendar(!showCalendar)} 
            />
            
            <AnimatePresence>
              {showCalendar && (
                <>
                  <div className="fixed inset-0 z-[60]" onClick={() => setShowCalendar(false)}></div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-4 w-[320px] bg-white rounded-xl shadow-[0_4px_32px_rgba(11,20,26,0.18)] border border-[#e9edef] z-[70] p-4 origin-top-right overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-4 px-2">
                      <span className="font-bold text-[#111b21]">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                      <div className="flex gap-2">
                        <ChevronLeft className="w-5 h-5 text-[#54656f] cursor-pointer hover:bg-[#f0f2f5] rounded-full" onClick={() => changeMonth(-1)} />
                        <ChevronRight className="w-5 h-5 text-[#54656f] cursor-pointer hover:bg-[#f0f2f5] rounded-full" onClick={() => changeMonth(1)} />
                      </div>
                    </div>
                    {renderCalendar()}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto bg-[#f8f9fa] flex flex-col items-center justify-start py-4">
        {selectedDate && (
          <div className="mb-4 bg-white px-4 py-2 rounded-full shadow-sm border border-[#e9edef] flex items-center gap-3 animate-in fade-in slide-in-from-top-2 mx-auto">
            <span className="text-xs font-bold text-[#00a884] uppercase tracking-wider">Date</span>
            <span className="text-sm text-[#111b21]">
              {selectedDate.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <X 
              className="w-4 h-4 text-[#8696a0] cursor-pointer hover:text-red-500 transition-colors" 
              onClick={() => setSelectedDate(null)} 
            />
          </div>
        )}

        {!query && !selectedDate ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <p className="text-[#667781] text-sm leading-relaxed">
              Search for messages within <span className="font-medium">{chatName}</span>.
            </p>
          </div>
        ) : filteredMessages.length > 0 ? (
          <div className="w-full flex flex-col">
            {filteredMessages.map((msg) => (
              <div 
                key={msg._id} 
                className="px-6 py-4 hover:bg-white border-b border-transparent hover:border-[#e9edef] transition-all cursor-pointer group"
                onClick={() => {
                  const el = document.getElementById(`msg-${msg._id}`);
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  el?.classList.add('bg-yellow-100');
                  setTimeout(() => el?.classList.remove('bg-yellow-100'), 2000);
                }}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[12px] text-[#667781] font-medium">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-[11px] text-[#8696a0]">
                    {formatMessageTime(msg.createdAt)}
                  </span>
                </div>
                <p className="text-[14px] text-[#3b4a54] line-clamp-2 leading-snug group-hover:text-[#111b21]">
                  {msg.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
             <p className="text-[#667781] text-sm font-medium">No messages found</p>
             {(query || selectedDate) && (
               <p className="text-[#8696a0] text-xs mt-2">
                 Try a different {query && selectedDate ? 'combination' : query ? 'search term' : 'date'}
               </p>
             )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MessageSearchSidebar;
