import React from 'react';
import { Search, Plus } from 'lucide-react';
import Avatar from '../../ui/Avatar';

const SidebarSearch = ({ query, onChange, results, onSendInvite }) => {
  return (
    <div className="p-4 bg-[#f0f2f5] animate-in slide-in-from-top duration-200">
      <div className="bg-white flex items-center px-3 py-1.5 rounded-lg mb-4">
        <Search className="w-5 h-5 text-[#8696a0]" />
        <input 
          type="text" 
          placeholder="Search username..." 
          className="bg-transparent border-none outline-none w-full px-4 text-sm text-[#3b4a54]"
          value={query}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <div className="max-h-60 overflow-y-auto">
        {results.map(result => (
          <div key={result._id} className="flex items-center justify-between p-2 hover:bg-white rounded-lg transition-colors mb-1">
            <div className="flex items-center gap-3">
              <Avatar src={result.avatar} name={result.name} />
              <div>
                <p className="text-sm font-medium text-[#111b21]">{result.name}</p>
                <p className="text-xs text-[#667781]">@{result.username}</p>
              </div>
            </div>
            <button onClick={() => onSendInvite(result._id)} className="bg-[#00a884] text-white p-1.5 rounded-full hover:bg-[#008f6f]">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SidebarSearch;
