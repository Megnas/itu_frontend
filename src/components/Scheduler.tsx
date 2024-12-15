import "./Scheduler.css"
import TimeTable, { TimeBlocks } from "./TimeTable";
import useFetchData from "./useFetchData";
import WeekSelector from "./WeekSelector";
import { useEffect, useState } from "react";
import { format, getDay, parseISO } from "date-fns";
import { SchedulerState } from "./SchedulerState";
import TimeSelector from "./TimeSelector";
import Dropdown from "./DropDown";
import usePostRequest from "./usePostRequest";
import usePutRequest from "./usePutRequest";

interface TimeBlockPosition {
    start: number;
    end: number;
    day: number;
    name: string
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

function formatToISODate(prefix: string, totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');

    return `${prefix}T${formattedHours}:${formattedMinutes}:00`;
}

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
    const [schedulerState, SetSchedulerState] = useState<SchedulerState>(SchedulerState.default);
    const [editBlock, setEditBlock] = useState<TimeBlockPosition | null>(null);
    const [selectedPub, setSelectedPub] = useState<number>(0);

    const [selectedWeekStart, setSelectedWeekStart] = useState(new Date());
    const formateDate = format(selectedWeekStart, "yyyy-MM-dd");

    const postRequest = usePostRequest("/meeting");
    const putRequest = usePutRequest("");
    const timeTableResponse = useFetchData<TimetableResponse>(`/user_busy?user_id=${id}&date=${formateDate}`, [postRequest.response]);
    const timeTableMeetingResponse = useFetchData<MeetingResponse>(`/meeting?user_id=${id}&date=${formateDate}`, [postRequest.response]);
    const pubs = useFetchData<PubList>("/pub");

    const pubDict = pubs.data ? transformToIdNameDict(pubs.data) : {};
    const pubDictBlacklisted = pubs.data ? transformToIdNameDictBlackListed(pubs.data, id) : {};

    const block = timeTableResponse.data ? timeTableResponse.data?.timetable_items.map(item => {
        const beginTime = parseISO(item.begin); // Parse the begin time into a Date object
        const endTime = parseISO(item.end); // Parse the end time into a Date object

        const day = getDay(beginTime) == 0 ? 6 : getDay(beginTime) - 1; // Get the day of the week (0 = Sunday, 1 = Monday, etc.)

        const startHour = beginTime.getHours() * 4 + Math.floor(beginTime.getMinutes() / 15); // Extract the hour from begin time
        const endHour = endTime.getHours() * 4 + Math.floor(beginTime.getMinutes() / 15); // Extract the hour from end time

        return {
            start: startHour,
            end: endHour,
            day: day,
            name: item.name,
        };
    }) : [];

    const meetingBlock = timeTableMeetingResponse.data ? timeTableMeetingResponse.data?.meetings.map(item => {
        const beginTime = parseISO(item.begin); // Parse the begin time into a Date object
        const endTime = parseISO(item.end); // Parse the end time into a Date object

        const day = getDay(beginTime) == 0 ? 6 : getDay(beginTime) - 1; // Get the day of the week (0 = Sunday, 1 = Monday, etc.)

        const startHour = beginTime.getHours() * 4 + Math.floor(beginTime.getMinutes() / 15); // Extract the hour from begin time
        const endHour = endTime.getHours() * 4 + Math.floor(beginTime.getMinutes() / 15); // Extract the hour from end time

        return {
            start: startHour,
            end: endHour,
            day: day,
            name: pubDict[item.pub_id],
        };
    }) : [];

    if(pubs.error){
        return(
            <div>Error: {pubs.error}</div>
        );
    }

    if(timeTableResponse.error){
        return(
            <div>Error: {timeTableResponse.error}</div>
        );
    }

    if(timeTableMeetingResponse.error){
        return(
            <div>Error: {timeTableMeetingResponse.error}</div>
        );
    }

    const handleWeekChange = (newWeekStart: Date) => {
        setSelectedWeekStart(newWeekStart);
        console.log(newWeekStart);
    };

    const SetSchedulerStateFunc = (state: SchedulerState) => {
        SetSchedulerState(state);
        console.log("Handling change of state");
    }

    const HandleStartChange = (minutes: number) => {
        if (editBlock) {
            console.log("Handling Edit Block Change")
            const newTime = Math.floor(minutes / 15);

            setEditBlock((prev) => ({
                ...prev!,
                start: newTime
            }));
        }
    }

    const HandleEndChange = (minutes: number) => {
        if (editBlock) {
            console.log("Handling Edit Block Change")
            const newTime = Math.floor(minutes / 15);
            console.log("New time is: ", newTime, "{Minutes: ", minutes, "}")

            setEditBlock((prev) => ({
                ...prev!,
                end: newTime
            }));
        }
    }
    
    const handleSelect = (selectedKey: number) => {
        setSelectedPub(selectedKey);
        console.log("Selected: ", selectedKey);
    }

    const b_end = editBlock ? editBlock.end * 15 : 0;
    const b_start = editBlock ? editBlock.start * 15 : 0;
    const b_day = editBlock ? editBlock.day : 0;


    const HandleDone = () => {
        SetSchedulerStateFunc(SchedulerState.default);
        postRequest.sendPostRequest({pub_id: selectedPub, owner_id: id, begin: formatToISODate2(selectedWeekStart, b_start, b_day), end: formatToISODate2(selectedWeekStart, b_end, b_day)});
        setEditBlock(null);
    }

    return(
        <div>
            <WeekSelector onWeekChange={handleWeekChange}/>
            <p>Loading: {(timeTableResponse.loading || timeTableMeetingResponse.loading || pubs.loading) ? "Loading" : "Done"}</p>
            <TimeTable blocks={block} meetingBlock={meetingBlock} state={schedulerState} setSchedulerState={SetSchedulerStateFunc} editBlock={editBlock} setEditBlock={setEditBlock}/>
            <div>
            {schedulerState == SchedulerState.default &&
                <button onClick={() => SetSchedulerStateFunc(SchedulerState.createNewEvent)} className="big-button">New Meeting</button>
            }
            {schedulerState == SchedulerState.editNewEvent &&
                <>
                    <p>Select pub</p>
                    <Dropdown options={pubDictBlacklisted} onSelect={handleSelect} />
                    <p>Start: </p>
                    <TimeSelector default_time={b_start} on_change={HandleStartChange} ending_timer={false}/>
                    <p>End: </p>
                    <TimeSelector default_time={b_end} on_change={HandleEndChange} ending_timer={true}/>
                    <p></p>
                    <button onClick={HandleDone} className="big-button">Done</button>
                </>
            }
            </div>
        </div>
    );
};

export default Scheduler;