//Projekt ITU - Pivní Plánovač
//Autor: Dominik Václavík

import "./Scheduler.css"
import TimeTable, { TimeBlocks } from "./TimeTable";
import useFetchData from "./useFetchData";
import WeekSelector from "./WeekSelector";
import { useEffect, useMemo, useState } from "react";
import { format, getDay, parseISO } from "date-fns";
import { SchedulerState } from "./SchedulerState";
import TimeSelector from "./TimeSelector";
import Dropdown from "./DropDown";
import usePostRequest from "./usePostRequest";
import usePutRequest from "./usePutRequest";
import useDeleteRequest from "./useDeleteRequest";

interface TimeBlockPosition {
    start: number;
    end: number;
    day: number;
    name: string;
    type: number;
    id: number;
}

interface TimetableItem {
    id: number;
    name: string;
    begin: string;
    end: string;
    user_id: number;
}

interface TimetableResponse {
    timetable_items: TimetableItem[];
}

interface MeetingItem {
    id: number;
    pub_id: number;
    owner_id: number;
    begin: string;
    end: string;
}

interface MeetingResponse {
    meetings: MeetingItem[];
}

interface Pub {
    id: number;
    name: string;
    address: string;
    blacklisted_users: number[];
}

interface PubList{
    pubs: Pub[];
}

interface MeetingCreationResponse {
    message: string;
    meeting_id: number;
}

interface SelectedBlockIdentifier {
    type: number;
    id: number;
}

const transformToIdNameDict = (pubList: PubList): { [id: number]: string } => {
    return pubList.pubs.reduce((acc, pub) => {
        acc[pub.id] = pub.name;
        return acc;
    }, {} as { [id: number]: string });
};

const transformToIdNameDictBlackListed = (pubList: PubList, currentUserId: number): { [id: number]: string } => {
    return pubList.pubs.reduce((acc, pub) => {
        // Check if currentUserId is NOT in the blacklisted_users array
        if (!pub.blacklisted_users.includes(currentUserId)) {
            acc[pub.id] = pub.name;
        }
        return acc;
    }, {} as { [id: number]: string });
};

function formatToISODate2(currentWeekDate: Date, totalMinutes: number, dayOffset: number): string {
    // Clone currentWeekDate to avoid modifying the original date
    const startOfWeek = new Date(currentWeekDate);
    console.log("Week Start", currentWeekDate);

    // Apply the day offset
    const targetDate = new Date(startOfWeek);
    console.log("Day Offset", dayOffset);
    console.log("Get Date Value", startOfWeek.getDate());
    targetDate.setDate(startOfWeek.getDate() + dayOffset + 1);
    console.log("Week Targer", targetDate);

    // Calculate hours and minutes from totalMinutes
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    // Format date and time to ISO string
    const formattedDate = targetDate.toISOString().split('T')[0];
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');

    console.log("Week Targer Format", formattedDate);

    return `${formattedDate}T${formattedHours}:${formattedMinutes}:00`;
}

const Scheduler: React.FC<{id: number}> = ({ id }) => {
    //Scheduler state for FSM
    const [schedulerState, SetSchedulerState] = useState<SchedulerState>(SchedulerState.default);
    const [selectedBlockID, SetSelectedBlockID] = useState<SelectedBlockIdentifier>({id: -1, type: -1});

    //Current Week Date
    const [selectedWeekStart, setSelectedWeekStart] = useState(new Date());
    const formateDate = format(selectedWeekStart, "yyyy-MM-dd");

    //API Calls
    const postRequest = usePostRequest<any, any>("/meeting");
    const putRequest = usePutRequest(`/meeting/${selectedBlockID.id}`);
    const deleteRequest = useDeleteRequest(`/meeting`);
    const timeTableResponse = useFetchData<TimetableResponse>(`/user_busy?user_id=${id}&date=${formateDate}`, [postRequest.response, putRequest.response]);
    const timeTableMeetingResponse = useFetchData<MeetingResponse>(`/meeting?owner_id=${id}&date=${formateDate}`, [postRequest.response, putRequest.response, deleteRequest.status]);
    const timeTableMeetingParticipantResponse = useFetchData<MeetingResponse>(`/meeting_participant?user_id=${id}&date=${formateDate}`, [postRequest.response, putRequest.response]);
    const pubs = useFetchData<PubList>("/pub");

    //Black list bubs
    const pubDict = pubs.data ? transformToIdNameDict(pubs.data) : {};
    const pubDictBlacklisted = pubs.data ? transformToIdNameDictBlackListed(pubs.data, id) : {};

    //Parsing Block Data
    const busyBlock = useMemo(() => {
        if (!timeTableResponse.data) return [];
        return timeTableResponse.data.timetable_items.map(item => {
            const beginTime = parseISO(item.begin); // Parse the begin time into a Date object
            const endTime = parseISO(item.end); // Parse the end time into a Date object
    
            const day = getDay(beginTime) === 0 ? 6 : getDay(beginTime) - 1; // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
    
            const startHour = beginTime.getHours() * 4 + Math.floor(beginTime.getMinutes() / 15); // Extract the hour from begin time
            const endHour = endTime.getHours() * 4 + Math.floor(endTime.getMinutes() / 15); // Extract the hour from end time
    
            return {
                start: startHour,
                end: endHour,
                day: day,
                name: item.name,
                type: 0,
                id: item.id,
            };
        });
    }, [timeTableResponse.data]); // Dependencies for memoization

    //Parsing Meet Block Data
    const meetingBlock = useMemo(() => {
        if (!timeTableMeetingResponse.data) return [];
        return timeTableMeetingResponse.data.meetings.map(item => {
            const beginTime = parseISO(item.begin); // Parse the begin time into a Date object
            const endTime = parseISO(item.end); // Parse the end time into a Date object
    
            const day = getDay(beginTime) === 0 ? 6 : getDay(beginTime) - 1; // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
    
            const startHour = beginTime.getHours() * 4 + Math.floor(beginTime.getMinutes() / 15); // Extract the hour from begin time
            const endHour = endTime.getHours() * 4 + Math.floor(endTime.getMinutes() / 15); // Extract the hour from end time
    
            return {
                start: startHour,
                end: endHour,
                day: day,
                name: pubDict[item.pub_id],
                type: 1,
                id: item.id,
            };
        });
    }, [timeTableMeetingResponse.data, pubDict]); // Dependencies for memoization

    //Parsing Meet Block Data
    const meetingParticipantBlock = useMemo(() => {
        if (!timeTableMeetingParticipantResponse.data) return [];
        return timeTableMeetingParticipantResponse.data.meetings.map(item => {
            const beginTime = parseISO(item.begin); // Parse the begin time into a Date object
            const endTime = parseISO(item.end); // Parse the end time into a Date object
    
            const day = getDay(beginTime) === 0 ? 6 : getDay(beginTime) - 1; // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
    
            const startHour = beginTime.getHours() * 4 + Math.floor(beginTime.getMinutes() / 15); // Extract the hour from begin time
            const endHour = endTime.getHours() * 4 + Math.floor(endTime.getMinutes() / 15); // Extract the hour from end time
    
            return {
                start: startHour,
                end: endHour,
                day: day,
                name: pubDict[item.pub_id],
                type: 2,
                id: item.id,
            };
        });
    }, [timeTableMeetingParticipantResponse.data, pubDict]); // Dependencies for memoization

    const AllBlocks = [...busyBlock, ...meetingBlock, ...meetingParticipantBlock];
    const currentTimeBlock = AllBlocks.find(obj => (obj.id === selectedBlockID.id && obj.type === selectedBlockID.type));
    const currentMeeting = timeTableMeetingResponse.data?.meetings.find(obj => (obj.id === selectedBlockID.id));
    console.log("Time block info", currentTimeBlock?.start, currentTimeBlock?.end)
    console.log("Meeting Info", currentMeeting?.pub_id)

    //Handling Errors
    if(pubs.error){
        return(
            <div>Error: {pubs.error}</div>
        );
    }
    else if(timeTableResponse.error){
        return(
            <div>Error: {timeTableResponse.error}</div>
        );
    }
    else if(timeTableMeetingResponse.error){
        return(
            <div>Error: {timeTableMeetingResponse.error}</div>
        );
    }

    //Handle change of Week
    const handleWeekChange = (newWeekStart: Date) => {
        setSelectedWeekStart(newWeekStart);
        console.log(newWeekStart);
    };

    //Handle Change of State
    const SetSchedulerStateFunc = (state: SchedulerState) => {
        SetSchedulerState(state);
        console.log("Handling change of state");
    }

    //Hadle Block Change
    const HandleStartChange = (minutes: number) => {
        console.log("Handling Edit Block Change Start", minutes);
        const newTime = Math.floor(minutes / 15);
        putRequest.sendPutRequest({begin: formatToISODate2(selectedWeekStart, newTime * 15, currentTimeBlock? currentTimeBlock.day : 0)});
    }
    const HandleEndChange = (minutes: number) => {
        console.log("Handling Edit Block Change End", minutes);
        const newTime = Math.floor(minutes / 15);
        putRequest.sendPutRequest({end: formatToISODate2(selectedWeekStart, newTime * 15, currentTimeBlock? currentTimeBlock.day : 0)});
    }
    
    const handleBlockSelectCallback = (block: TimeBlockPosition) => {
        SetSelectedBlockID(block);
        SetSchedulerStateFunc(SchedulerState.editNewEvent);
    }

    //Hadle Selected Pub
    const handlePubSelect = (selectedKey: number) => {
        console.log("Selected: ", selectedKey);
        putRequest.sendPutRequest({pub_id: selectedKey});
    }

    const HandleDone = () => {
        SetSchedulerStateFunc(SchedulerState.default);
    }

    const checkCollision = (block1: TimeBlockPosition, block2: TimeBlockPosition): boolean => {
        if (block1.day !== block2.day) {
          return false;
        }
        return !(block1.end <= block2.start || block1.start >= block2.end);
    };

    const CreateNewMeetingCallback = (response: MeetingCreationResponse | null, error: string | null) => {
        if(error){
            console.log("Cannot Create Block: Server");
            return;
        }

        SetSelectedBlockID({id : response? response.meeting_id : 0, type : 1});

        console.log("Selected block: ", selectedBlockID);
        SetSchedulerStateFunc(SchedulerState.editNewEvent);
    }

    const HandleNewBlockCallback = (block: TimeBlockPosition) => {
        SetSchedulerStateFunc(SchedulerState.default);

        while(block.start < block.end){
            if(AllBlocks.some(existingBlock => checkCollision(block, existingBlock))){
                console.log("Resizing Block");
                block.end--;
            }
            else {
                postRequest.sendPostRequest({pub_id: parseInt(Object.keys(pubDictBlacklisted)[0], 10), owner_id: id, begin: formatToISODate2(selectedWeekStart, block.start * 15, block.day), end: formatToISODate2(selectedWeekStart, block.end * 15, block.day)}, CreateNewMeetingCallback);
                console.log("Created Block");
                return;
            }
        }

        console.log("Cannot Create Block");
    }

    const HandleChangeInSizeCallback = (called_block: TimeBlockPosition, start: boolean, change: number) => {
        if(start){
            putRequest.sendPutRequest({begin: formatToISODate2(selectedWeekStart, (called_block.start + change) * 15, called_block.day)});
        }
        else {
            putRequest.sendPutRequest({end: formatToISODate2(selectedWeekStart, (called_block.end + change) * 15, called_block.day)});
        }
    }

    const HandleDeselectCallback = () => {
        SetSchedulerStateFunc(SchedulerState.default)
    }

    const HandleRemove = () => {
        deleteRequest.handleDelete(`/${selectedBlockID.id}`);
        SetSchedulerStateFunc(SchedulerState.default);
    }

    return(
        <div>
            <WeekSelector onWeekChange={handleWeekChange}/>
            <p>Loading: {(timeTableResponse.loading || timeTableMeetingResponse.loading || pubs.loading || putRequest.loading) ? "Loading" : "Done"}</p>
            <TimeTable 
                state={schedulerState} 
                createNewBlockCallback={HandleNewBlockCallback} 
                blocks={AllBlocks} 
                selectBlockCallback={handleBlockSelectCallback} 
                selected_id={schedulerState == SchedulerState.editNewEvent ? selectedBlockID.id : -1} 
                deselectBlockCallback={HandleDeselectCallback}
                changeSizeCallBack={HandleChangeInSizeCallback}
                changeStateCallback={SetSchedulerStateFunc}
            />
            <div>
            {schedulerState == SchedulerState.default &&
                <button onClick={() => SetSchedulerStateFunc(SchedulerState.createNewEvent)} className="big-button">New Meeting</button>
            }
            {schedulerState == SchedulerState.editNewEvent &&
                <>
                    <p>Select pub</p>
                    <Dropdown options={pubDictBlacklisted} onSelect={handlePubSelect} selected={currentMeeting? currentMeeting.pub_id : -1}/>
                    <p>Start: </p>
                    <TimeSelector default_time={currentTimeBlock? (currentTimeBlock.start * 15) : 0} on_change={HandleStartChange} ending_timer={false}/>
                    <p>End: </p>
                    <TimeSelector default_time={currentTimeBlock? (currentTimeBlock.end * 15) : 0} on_change={HandleEndChange} ending_timer={true}/>
                    <p></p>
                    <button onClick={HandleRemove} className="big-button" style={{backgroundColor: "red"}}>REMOVE</button>
                    <button onClick={HandleDone} className="big-button">Done</button>
                </>
            }
            </div>
        </div>
    );
};

export default Scheduler;