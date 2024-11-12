import React, { useState } from 'react';

const TimeSelector: React.FC<{default_time: number, on_change: (minutes: number) => void}> = ({ default_time, on_change }) => {
  const default_h = Math.floor(default_time / 60);
  const default_m = default_time % 60;
  const [time, setTime] = useState<string>(`${String(default_h).padStart(2, '0')}:${String(default_m).padStart(2, '0')}`);

  // Function to handle input changes (manual time input)
  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTime(event.target.value);
    const [hours, minutes] = time.split(':').map(Number);
    on_change(hours * 60 + minutes);
  };

  // Function to handle incrementing the time by 15 minutes
  const incrementTime = () => {
    const [hours, minutes] = time.split(':').map(Number);
    let newMinutes = minutes + 15;
    let newHours = hours;

    if (newMinutes === 60) {
      newMinutes = 0;
      newHours = (newHours + 1) % 24; // Wrap hours at 24 (24-hour format)
    }

    const formattedTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
    setTime(formattedTime);
    on_change(newHours * 60 + newMinutes);
  };

  // Function to handle decrementing the time by 15 minutes
  const decrementTime = () => {
    const [hours, minutes] = time.split(':').map(Number);
    let newMinutes = minutes - 15;
    let newHours = hours;

    if (newMinutes < 0) {
      newMinutes = 45;
      newHours = (newHours - 1 + 24) % 24; // Wrap hours backward at 0 (24-hour format)
    }

    const formattedTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
    setTime(formattedTime);
    on_change(newHours * 60 + newMinutes);
  };

  return (
    <div>
      <div>
        <button onClick={decrementTime}>-15</button>
        <input
          type="time"
          value={time}
          onChange={handleTimeChange}
        />
        <button onClick={incrementTime}>+15</button>
      </div>
    </div>
  );
};

export default TimeSelector;
