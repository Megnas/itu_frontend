import { useRef, useState } from 'react';
import './TimeTable.css'
import { SchedulerState } from './SchedulerState';

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
    state: SchedulerState, 
    setSchedulerState: (state: SchedulerState) => void,
    editBlock: TimeBlockPosition | null,
    setEditBlock: (block: TimeBlockPosition) => void
}> = ( { blocks, state, setSchedulerState, editBlock, setEditBlock } ) => {
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
                {editBlock != null &&
                    <TimeBlock timeblock={editBlock} color='green'/>
                }
            </div>
            </div>
        </div>
    );
};

const TimeBlock: React.FC<{timeblock : TimeBlockPosition, color: string}> = ({ timeblock, color }) => {
    if(timeblock.start >= timeblock.end || 0 > timeblock.start || 0 > timeblock.end || timeblock.start > 96 || timeblock.end > 96 || timeblock.day < 0 || timeblock.day > 6){
        return(
            <></>
        );
    }

    const top = 55 + 52 * timeblock.day; //55 offset, 52 to move to anoter day
    const left = 3 + timeblock.start * 20 + Math.floor(timeblock.start / 4) * 2; //3 offset, 82 to move to another hour, 20 by quater hour, 2 for blank
    const width = 0 + 20 * (timeblock.end - timeblock.start) + (Math.floor((timeblock.end - timeblock.start - 1) / 4)) * 2; // 80 block size, 2 black space
    const height = 50; // 50 height

    return(
        <div className="overlay-div"
            style={{
                top: `${top}px`, left: `${left}px`, width: `${width}px`, height: `${height}px` , backgroundColor: color
            }}
        >
            {timeblock.name}
        </div>
    );
};

export default TimeTable;