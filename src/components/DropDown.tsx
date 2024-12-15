//Projekt ITU - Pivní Plánovač
//Autor: Dominik Václavík

import React, { useEffect, useState } from 'react';

interface DropdownProps {
  options: { [key: number]: string };
  onSelect: (selectedKey: number) => void;
  selected: number;
}

const Dropdown: React.FC<DropdownProps> = ({ options, onSelect, selected }) => {
  const [selectedValue, setSelectedValue] = useState<number>(selected);

  useEffect(()=> {
    setSelectedValue(selected);
  }, [selected]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const parsedValue = parseInt(event.target.value, 10);
    setSelectedValue(parsedValue);
    onSelect(parsedValue);
  };

  return (
    <select value={selectedValue} onChange={handleChange} style={{width: "300px", height: "40px"}}>
      {Object.entries(options).map(([key, value]) => (
        <option key={key} value={key}>
          {value}
        </option>
      ))}
    </select>
  );
};

export default Dropdown;