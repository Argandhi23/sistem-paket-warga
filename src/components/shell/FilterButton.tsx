'use client';

import { useState } from 'react';
import { Filter } from 'lucide-react';

type FilterButtonProps = {
  isOpen: boolean;
  onToggle: () => void;
};

export function FilterButton({ isOpen, onToggle }: FilterButtonProps) {
  return (
    <button 
      onClick={onToggle}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition-all ${
        isOpen 
          ? 'bg-primary-50 text-primary-600 border-primary-200 shadow-inner' 
          : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100 shadow-sm'
      }`}
    >
      <Filter size={16} /> 
      {isOpen ? 'Sembunyikan Filter' : 'Filter Data'}
    </button>
  );
}