import React, { useState } from 'react';

interface DropdownProps {
  options: { [key: number]: string };
  onSelect: (selectedKey: number) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ options, onSelect }) => {
  const [selectedValue, setSelectedValue] = useState<number | ''>('');

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedKey = parseInt(event.target.value, 10);
    setSelectedValue(selectedKey);
    onSelect(selectedKey);
  };

  return (
    <select value={selectedValue} onChange={handleChange} style={{width: "300px", height: "40px"}}>
      <option value="">Select an option</option>
      {Object.entries(options).map(([key, value]) => (
        <option key={key} value={key}>
          {value}
        </option>
      ))}
    </select>
  );
};

export default Dropdown;