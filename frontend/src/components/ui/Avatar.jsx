import React from 'react';

const Avatar = ({ src, name, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-14 h-14 text-lg'
  };

  return (
    <div className={`rounded-full flex items-center justify-center bg-[#00a884] text-white font-bold border border-white shadow-sm overflow-hidden flex-shrink-0 ${sizeClasses[size]} ${className}`}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        name?.charAt(0).toUpperCase() || '?'
      )}
    </div>
  );
};

export default Avatar;
