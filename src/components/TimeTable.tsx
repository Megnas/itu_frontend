//Projekt ITU - Pivní Plánovač
//Autor: Dominik Václavík

import { useEffect, useRef, useState } from 'react';
import './TimeTable.css'
import { SchedulerState } from './SchedulerState';
import { Console } from 'console';
import React from 'react';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timeSlots = ['00:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM', '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM',  '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM',  '11:00 PM'];

interface TimeBlockPosition {
    start: number;
    end: number;
    day: number;
    name: string;
    type: number;
    id: number;
}

export interface TimeBlocks {
    blocks: TimeBlockPosition[];
}

const TimeTable: React.FC<{
    blocks: TimeBlockPosition[], 
    state: SchedulerState, 
    createNewBlockCallback: (block: TimeBlockPosition) => void,
    selectBlockCallback: (block: TimeBlockPosition) => void,
    deselectBlockCallback: () => void,
    selected_id: number,
    changeSizeCallBack: (block: TimeBlockPosition, start: boolean, change: number) => void
    changeStateCallback: (state: SchedulerState) => void
}> = ( { blocks, state, createNewBlockCallback, selectBlockCallback, selected_id, deselectBlockCallback, changeSizeCallBack, changeStateCallback } ) => {
    const divRef = useRef<HTMLDivElement | null>(null);

    const handleClick = (event: React.MouseEvent) => {
        if(state == SchedulerState.createNewEvent){
            if (divRef.current) {
                const rect = divRef.current.getBoundingClientRect();
        
                const clickX = event.clientX - rect.left; // X position relative to the div
                const clickY = event.clientY - rect.top;  // Y position relative to the div
                
                if(clickX <= 3 || clickY <= 55)
                    return;
    
                const day = Math.floor((clickY - 55) / 52)
                const start = Math.floor((clickX - 3) / 20)
    
                console.log(`Click position relative to the div: day: ${day} start: ${start}`);
    
                createNewBlockCallback({
                    start : start,
                    end : start + 4,
                    day: day,
                    name: "Edit Block",
                    type: 1,
                    id: -1
                });
            }
        }
        else if (state == SchedulerState.editNewEvent){
            if (divRef.current) {
                console.log("Clicking on time table")
                deselectBlockCallback();
            }
        }
      };

    const typeToColorDict: { [key: number]: string } = {
        0: "red",
        1: "blue",
        2: "green",
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
                    <TimeBlock 
                        timeblock={block} 
                        color={typeToColorDict[block.type]} 
                        selectBlockCallback={selectBlockCallback} 
                        selected_id={selected_id} 
                        key={`${block.id}-${block.type}`} 
                        changeSizeCallBack={changeSizeCallBack}
                        changeStateCallback={changeStateCallback}
                    />
                ))}
            </div>
            </div>
        </div>
    );
};

let diff = 0;
const TimeBlock: React.FC<{
    timeblock : TimeBlockPosition,
    color: string,
    selectBlockCallback: (block: TimeBlockPosition) => void,
    selected_id: number
    changeSizeCallBack: (block: TimeBlockPosition, start: boolean, change: number) => void
    changeStateCallback: (state: SchedulerState) => void
}> = ({ timeblock, color, selectBlockCallback, selected_id, changeSizeCallBack, changeStateCallback}) => {
    const [isResizing, setIsResizing] = useState(false);
    const [handlingStart, SetHandlingStart] = useState(false);
    const [blockDiffStart, SetBlockDiffStart] = useState(0);
    const [blockDiffEnd, SetBlockDiffEnd] = useState(0);
    const [start, setStart] = useState(timeblock.start);
    const [end, setEnd] = useState(timeblock.end);

    useEffect(()=> {
        setStart(timeblock.start);
        setEnd(timeblock.end);
    }, [timeblock])

    const isValidTimeBlock = (): boolean => {
        return (
            start < end &&
            start >= 0 &&
            end <= 96 &&
            timeblock.day >= 0 &&
            timeblock.day <= 6
        );
      };    

    const [initalX, SetInitialX] = useState(0);

    const top = 55 + 52 * timeblock.day; //55 offset, 52 to move to anoter day
    const left = 3 + (start + blockDiffStart) * 20 + Math.floor((start + blockDiffStart) / 4) * 2; //3 offset, 82 to move to another hour, 20 by quater hour, 2 for blank
    const width = 0 + 20 * (end - start + blockDiffEnd - blockDiffStart) + (Math.floor((end - start - 1 + blockDiffEnd - blockDiffStart) / 4)) * 2; // 80 block size, 2 black space
    const height = 50; // 50 height

    // Handlers for resizing
    const handleMouseDownStart = (event: React.MouseEvent) => {
        setIsResizing(true);
        SetHandlingStart(true);
        changeStateCallback(SchedulerState.draging);
        console.log("mouse down");
        SetInitialX(event.clientX);
        event.stopPropagation(); // Prevent other event triggers
    };

    const handleMouseDownEnd = (event: React.MouseEvent) => {
        setIsResizing(true);
        SetHandlingStart(false);
        changeStateCallback(SchedulerState.draging);
        console.log("mouse down");
        SetInitialX(event.clientX);
        event.stopPropagation(); // Prevent other event triggers
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (!isResizing) return;
    
        const deltaX = event.clientX - initalX;

        if(handlingStart){
            let blockDiff = Math.ceil(deltaX / 20);
            const NewStart = timeblock.start + blockDiff;
            if(NewStart < 0){
                blockDiff = -timeblock.start;
            }
            else if(NewStart >= timeblock.end){
                blockDiff = timeblock.end - timeblock.start - 1;
            }
            SetBlockDiffStart(blockDiff);
            diff = blockDiff;
            console.log("Current start", deltaX, blockDiff, timeblock.start);
        }
        else {
            let blockDiff = Math.floor(deltaX / 20);
            const NewEnd = timeblock.end + blockDiff;
            if(NewEnd > 96){
                blockDiff = 96 - timeblock.end;
            }
            else if(NewEnd <= timeblock.start){
                blockDiff = timeblock.start - timeblock.end + 1;
            }
            SetBlockDiffEnd(blockDiff);
            diff = blockDiff;
            console.log("Current end", deltaX, blockDiff, timeblock.end);
        }
      };

    const handleMouseUp = () => {
        if (isResizing) {
            setIsResizing(false);
            console.log("mouse up");
            console.log("Diff", diff);
            changeSizeCallBack(timeblock, handlingStart, diff);
            if(handlingStart){
                setStart(start + diff);
            }
            else {
                setEnd(end + diff);
            }
            diff = 0;
            SetBlockDiffStart(0);
            SetBlockDiffEnd(0);
            changeStateCallback(SchedulerState.editNewEvent);
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

    const handleMouse = (event: React.MouseEvent) => {
        if(timeblock.type != 1){
            return;
        }
        event.stopPropagation();
        if(timeblock.id != selected_id){
            selectBlockCallback(timeblock);
        }
    }

    return(
        <div className="overlay-div"
            style={{
                top: `${top}px`, left: `${left}px`, width: `${width}px`, height: `${height}px` , backgroundColor: color
            }}
            onClick={handleMouse}
        >
            {(timeblock.id == selected_id && timeblock.type == 1) &&
            <div
            style={{
            width: "8px",
            height: "100%",
            backgroundColor: "#fff",
            cursor: "ew-resize",
            position: "absolute",
            pointerEvents: "all",
            right: width - 8,
            top: 0,
            }}
            onMouseDown={handleMouseDownStart}
            ></div>
            }
            <span style={{userSelect: 'none'}}>{timeblock.name}</span>
            {(timeblock.id == selected_id && timeblock.type == 1) &&
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
            onMouseDown={handleMouseDownEnd}
            ></div>
            }
        </div>
    );
};

export default TimeTable;