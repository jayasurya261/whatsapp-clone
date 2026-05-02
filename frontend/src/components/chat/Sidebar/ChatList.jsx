import React from 'react';
import { useChat } from '../../../context/ChatContext';
import Avatar from '../../ui/Avatar';
import { formatChatDate } from '../../../utils/dateUtils';

const ChatList = () => {
  const { chats, selectedChat, setSelectedChat, user } = useChat();

  if (chats.length === 0) {
    return (
      <div className="p-10 text-center text-[#667781] text-sm">
        No chats yet. Search for users and send invitations!
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      {chats.map((chat) => {
        const otherUser = chat.users.find(u => u._id !== user._id);
        const isSelected = selectedChat?._id === chat._id;

        return (
          <div 
            key={chat._id}
            onClick={() => setSelectedChat(chat)}
            className={`flex items-center px-3 h-[72px] cursor-pointer hover:bg-[#f5f6f6] transition-colors ${isSelected ? 'bg-[#f0f2f5]' : ''}`}
          >
            <Avatar src={otherUser.avatar} name={otherUser.name} size="lg" />
            <div className="flex-1 ml-4 border-b border-[#e9edef] h-full flex flex-col justify-center py-2 overflow-hidden">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-medium text-[#111b21] truncate">{otherUser.name}</h3>
                <span className="text-xs text-[#667781]">
                  {chat.latestMessage ? formatChatDate(chat.latestMessage.createdAt) : ''}
                </span>
              </div>
              <p className="text-sm text-[#667781] truncate pr-2">
                {chat.latestMessage ? chat.latestMessage.content : 'No messages yet'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;
