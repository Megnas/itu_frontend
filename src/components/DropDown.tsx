import React, { useEffect, useState } from 'react';

interface DropdownProps {
  options: { [key: number]: string };
  onSelect: (selectedKey: number) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ options, onSelect }) => {
  const [selectedValue, setSelectedValue] = useState<number>(parseInt(Object.keys(options)[0], 10));

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedValue(parseInt(event.target.value, 10));
  };

  useEffect(() => {
    onSelect(selectedValue);
  }, [selectedValue]);

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