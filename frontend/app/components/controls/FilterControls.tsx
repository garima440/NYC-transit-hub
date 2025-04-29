// frontend/app/components/Controls/FilterControls.tsx
import React from 'react';
import { TransitType } from '../../lib/constants';

interface FilterControlsProps {
  activeFilters: Record<string, boolean>;
  onFilterChange: (filterType: string, value: boolean) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({ 
  activeFilters, 
  onFilterChange 
}) => {
  return (
    <div className="filter-controls">
      <h3>Transit Types</h3>
      <div className="filter-options">
        <label>
          <input
            type="checkbox"
            checked={activeFilters[TransitType.SUBWAY]}
            onChange={(e) => onFilterChange(TransitType.SUBWAY, e.target.checked)}
          />
          Subway
        </label>
        
        <label>
          <input
            type="checkbox"
            checked={activeFilters[TransitType.BUS]}
            onChange={(e) => onFilterChange(TransitType.BUS, e.target.checked)}
          />
          Bus
        </label>
        
        <label>
          <input
            type="checkbox"
            checked={activeFilters[TransitType.LIRR]}
            onChange={(e) => onFilterChange(TransitType.LIRR, e.target.checked)}
          />
          LIRR
        </label>
        
        <label>
          <input
            type="checkbox"
            checked={activeFilters[TransitType.MNR]}
            onChange={(e) => onFilterChange(TransitType.MNR, e.target.checked)}
          />
          Metro North
        </label>
      </div>
    </div>
  );
};

export default FilterControls;