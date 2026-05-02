import React from 'react';
import { Bell, UserPlus, MoreVertical, Check, X } from 'lucide-react';
import { useChat } from '../../../context/ChatContext';
import Avatar from '../../ui/Avatar';
import IconButton from '../../ui/IconButton';

const SidebarHeader = ({ onLogout, onToggleInvitations, onToggleSearch, invitations, showInvitations, onAcceptInvite }) => {
  const { user } = useChat();

  return (
    <div className="h-[60px] bg-[#f0f2f5] flex items-center justify-between px-4 relative">
      <div className="flex items-center gap-3 relative group">
        <Avatar src={user?.avatar} name={user?.username} />
        <span className="font-semibold text-[#3b4a54] truncate max-w-[120px]">
          {user?.name || user?.username}
        </span>
        <div className="absolute top-full left-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity z-50">
          <button 
            onClick={onLogout} 
            className="bg-white text-red-600 text-xs font-bold px-4 py-2 rounded shadow-md border border-red-100 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="flex gap-2 text-[#54656f]">
        <div className="relative">
          <IconButton 
            icon={Bell} 
            onClick={onToggleInvitations} 
            badge={invitations.length}
            active={showInvitations}
          />
          {showInvitations && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg py-2 z-[60] border border-[#e9edef]">
              <h4 className="px-4 py-2 font-bold text-[#111b21] border-b">Invitations</h4>
              {invitations.length === 0 ? (
                <p className="px-4 py-4 text-sm text-[#667781]">No pending invitations</p>
              ) : (
                invitations.map(invite => (
                  <div key={invite._id} className="px-4 py-3 hover:bg-[#f5f6f6] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar src={invite.sender.avatar} name={invite.sender.name} size="sm" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-[#111b21]">{invite.sender.name}</span>
                        <span className="text-xs text-[#667781]">@{invite.sender.username}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Check className="w-5 h-5 text-green-500 cursor-pointer" onClick={() => onAcceptInvite(invite._id)} />
                      <X className="w-5 h-5 text-red-500 cursor-pointer" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <IconButton 
          icon={UserPlus} 
          onClick={onToggleSearch} 
        />
        <IconButton 
          icon={MoreVertical} 
          onClick={() => {}} 
        />
      </div>
    </div>
  );
};

export default SidebarHeader;

