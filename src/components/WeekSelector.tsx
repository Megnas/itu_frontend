//Projekt ITU - Pivní Plánovač
//Autor: Dominik Václavík

import React, { useEffect, useState } from "react";
import { format, startOfWeek, addWeeks, endOfWeek } from "date-fns";

// Add a prop to accept the callback function
interface WeekSelectorProps {
    onWeekChange: (startDate: Date) => void;
}

const WeekSelector: React.FC<WeekSelectorProps> = ({ onWeekChange }) => {
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

    // Format the week to show start and end dates
    const formattedWeek = `${format(currentWeekStart, "MMM d")} - ${format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), "MMM d")}`;
    
    // Get the current date formatted
    const currentDate = format(new Date(), "EEEE, MMMM d, yyyy");

    useEffect(() => {
        onWeekChange(currentWeekStart); // Trigger with the current date when the component mounts
    }, []);

    // Move to the previous week
    function handlePrevWeek() {
        setCurrentWeekStart(prev => {
            const newWeekStart = addWeeks(prev, -1);
            onWeekChange(newWeekStart); // Pass the new start date to the parent
            return newWeekStart;
        });
    }

    // Move to the next week
    function handleNextWeek() {
        setCurrentWeekStart(prev => {
            const newWeekStart = addWeeks(prev, 1);
            onWeekChange(newWeekStart); // Pass the new start date to the parent
            return newWeekStart;
        });
    };

    return (
        <div style={{ textAlign: 'center', margin: '20px' }}>
            <h2>Select a Week</h2>
            <div style={{ marginBottom: '15px', fontSize: '18px', color: '#555' }}>
                <span>Today: {currentDate}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <button onClick={handlePrevWeek}>Previous</button>
                <div style={{ margin: '0 15px', fontSize: '18px' }}>{formattedWeek}</div>
                <button onClick={handleNextWeek}>Next</button>
            </div>
        </div>
    );
};

export default WeekSelector;
