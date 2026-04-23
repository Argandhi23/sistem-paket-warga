'use client';

import { useState } from 'react';
import { FilterButton } from './FilterButton';
import { FilterPanel } from './FilterPanel';

type FilterToggleProps = {
  baseUrl: string;
};

export default function FilterToggle({ baseUrl }: FilterToggleProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <FilterButton isOpen={isVisible} onToggle={() => setIsVisible(!isVisible)} />
      <FilterPanel baseUrl={baseUrl} isOpen={isVisible} />
    </>
  );
}