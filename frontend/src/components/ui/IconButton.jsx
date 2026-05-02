import React from 'react';

const IconButton = ({ 
  icon: Icon, 
  onClick, 
  className = '', 
  active = false,
  badge = null,
  tooltip = ''
}) => {
  return (
    <div className="relative group">
      <button 
        onClick={onClick}
        className={`p-2 rounded-full transition-colors relative ${active ? 'bg-black/10 text-[#00a884]' : 'text-[#54656f] hover:bg-black/5'} ${className}`}
        title={tooltip}
      >
        <Icon className="w-6 h-6 cursor-pointer" />
        {badge > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
            {badge}
          </span>
        )}
      </button>
    </div>
  );
};

export default IconButton;
