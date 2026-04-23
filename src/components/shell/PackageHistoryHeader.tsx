'use client';

import { useState } from 'react';
import { Filter, Download } from 'lucide-react';
import PackageFilter from './PackageFilter';

type PackageHistoryHeaderProps = {
  title: string;
  baseUrl: string;
};

export default function PackageHistoryHeader({ title, baseUrl }: PackageHistoryHeaderProps) {
  const [showFilter, setShowFilter] = useState(false);

  return (
    <div className="p-6 border-b">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-primary">{title}</h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition-all ${
              showFilter 
                ? 'bg-primary/10 text-primary border-primary/20 shadow-inner' 
                : ' text-neutral  shadow-sm'
            }`}
          >
            <Filter size={16} /> 
            {showFilter ? 'Sembunyikan Filter' : 'Filter Data'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-neutral rounded-lg text-sm font-bold border shadow-sm">
            <Download size={16} /> Export
          </button>
        </div>
      </div>
      
      {showFilter && (
        <div className="mt-6">
          <PackageFilter baseUrl={baseUrl} />
        </div>
      )}
    </div>
  );
}
