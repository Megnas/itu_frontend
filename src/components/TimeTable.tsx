import { useRef, useState } from 'react';
import './TimeTable.css'
import { SchedulerState } from './SchedulerState';
import { Console } from 'console';
import React from 'react';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timeSlots = ['12:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM', '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM',  '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM',  '11:00 PM'];

interface TimeBlockPosition {
    start: number;
    end: number;
    day: number;
    name: string
}

export interface TimeBlocks {
    blocks: TimeBlockPosition[];
}

const TimeTable: React.FC<{
    blocks: TimeBlockPosition[], 
    meetingBlock: TimeBlockPosition[],
    state: SchedulerState, 
    setSchedulerState: (state: SchedulerState) => void,
    editBlock: TimeBlockPosition | null,
    setEditBlock: (block: TimeBlockPosition) => void
}> = ( { blocks, meetingBlock, state, setSchedulerState, editBlock, setEditBlock } ) => {
    const divRef = useRef<HTMLDivElement | null>(null);

    const handleClick = (event: React.MouseEvent) => {
        if(state != SchedulerState.createNewEvent) return;

        if (divRef.current) {
            const rect = divRef.current.getBoundingClientRect();
    
            const clickX = event.clientX - rect.left; // X position relative to the div
            const clickY = event.clientY - rect.top;  // Y position relative to the div
            
            if(clickX <= 3 || clickY <= 55)
                return;

            const day = Math.floor((clickY - 55) / 52)
            const start = Math.floor((clickX - 3) / 20)

            console.log(`Click position relative to the div: day: ${day} start: ${start}`);

            setSchedulerState(SchedulerState.editNewEvent);
            setEditBlock({
                start : start,
                end : start + 4,
                day: day,
                name: "Edit Block"
            });
        }
      };

    return(
        <div className="timetable">
            <table>
                <thead>
                    <tr>
                        <th>
                        <div className='table-container-header'>Time</div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                {daysOfWeek.map(day =>(
                    <tr>
                        <th><div className='table-container-header'>{day}</div></th>
                    </tr>
                ))}
                </tbody>
            </table>
            <div className="timetable-container">
            <div ref={divRef} onClick={handleClick}>
            <table>
                <thead>
                    <tr>
                    {timeSlots.map(slot =>(
                        <th><div className='table-container'>{slot}</div></th>
                    ))}
                    </tr>
                </thead>
                <tbody>
                {daysOfWeek.map(day =>(
                    <tr>
                    {timeSlots.map(slot => (
                        <td><div className='table-container'></div></td>
                    ))}
                    </tr>
                ))}
                </tbody>
                
            </table>
                {blocks.map( block => (
                    <TimeBlock timeblock={block} color='red'/>
                ))}
                {meetingBlock.map( block => (
                    <TimeBlock timeblock={block} color='blue'/>
                ))}
                {editBlock != null &&
                    <TimeBlock timeblock={editBlock} color='green'/>
                }
            </div>
            </div>
        </div>
    );
};

const TimeBlock: React.FC<{timeblock : TimeBlockPosition, color: string}> = ({ timeblock, color }) => {
    const [isResizing, setIsResizing] = useState(false);
    const [currentEnd, setCurrentEnd] = useState(timeblock.end); // Resizable end time

    const isValidTimeBlock = (): boolean => {
        return (
          timeblock.start < timeblock.end &&
          timeblock.start >= 0 &&
          timeblock.end <= 96 &&
          timeblock.day >= 0 &&
          timeblock.day <= 6
        );
      };

    const top = 55 + 52 * timeblock.day; //55 offset, 52 to move to anoter day
    const left = 3 + timeblock.start * 20 + Math.floor(timeblock.start / 4) * 2; //3 offset, 82 to move to another hour, 20 by quater hour, 2 for blank
    const width = 0 + 20 * (timeblock.end - timeblock.start) + (Math.floor((timeblock.end - timeblock.start - 1) / 4)) * 2; // 80 block size, 2 black space
    const height = 50; // 50 height

    // Handlers for resizing
    const handleMouseDown = (event: React.MouseEvent) => {
        setIsResizing(true);
        console.log("mouse down");
        event.stopPropagation(); // Prevent other event triggers
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (!isResizing) return;
    
        // Calculate new end time based on mouse position
        const boundingRect = (event.target as HTMLElement).parentElement?.getBoundingClientRect();
        if (!boundingRect) return;
    
        const deltaX = event.clientX - boundingRect.left;
        const newEnd = Math.min(
          Math.max(timeblock.start + Math.floor(deltaX / 20), timeblock.start + 1),
          96
        );
    
        setCurrentEnd(newEnd);
        console.log("Current end", event.clientX);
      };

    const handleMouseUp = () => {
        if (isResizing) {
            console.log("mouse up");
          setIsResizing(false);
    
          //TODO: CALL BACK
          // Trigger the resize callback
          //if (onResize) {
          //  onResize({ ...timeblock, end: currentEnd });
          //}
        }
      };


     // Attach mousemove and mouseup events globally
    React.useEffect(() => {
        if (isResizing) {
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        } else {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        }

        return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isResizing]);
    
    if (!isValidTimeBlock()) {
        console.warn("Invalid timeblock:", timeblock);
        return null;
    }

    return(
        <div className="overlay-div"
            style={{
                top: `${top}px`, left: `${left}px`, width: `${width}px`, height: `${height}px` , backgroundColor: color
            }}
        >
            <span style={{userSelect: 'none'}}>{timeblock.name}</span>
            <div
            style={{
            width: "8px",
            height: "100%",
            backgroundColor: "#fff",
            cursor: "ew-resize",
            position: "absolute",
            pointerEvents: "all",
            right: 0,
            top: 0,
            }}
            onMouseDown={handleMouseDown}
            ></div>
        </div>
    );
};

export default TimeTable;