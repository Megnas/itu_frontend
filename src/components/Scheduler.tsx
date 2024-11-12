import "./Scheduler.css"
import TimeTable, { TimeBlocks } from "./TimeTable";
import useFetchData from "./useFetchData";
import WeekSelector from "./WeekSelector";
import { useEffect, useState } from "react";
import { format, getDay, parseISO } from "date-fns";
import { SchedulerState } from "./SchedulerState";
import TimeSelector from "./TimeSelector";

interface TimetableItem {
    id: number;
    name: string;
    begin: string;
    end: string;
    user_id: number;
}

interface TimeBlockPosition {
    start: number;
    end: number;
    day: number;
    name: string
}

interface TimetableResponse {
    timetable_items: TimetableItem[];
}

const Scheduler: React.FC = () => {
    const [schedulerState, SetSchedulerState] = useState<SchedulerState>(SchedulerState.default);
    const [editBlock, setEditBlock] = useState<TimeBlockPosition | null>(null);

    const [selectedWeekStart, setSelectedWeekStart] = useState(new Date());
    const formateDate = format(selectedWeekStart, "yyyy-MM-dd");

    const timeTableResponse = useFetchData<TimetableResponse>(`/user_busy?user_id=${1}&date=${formateDate}`);

    const block = timeTableResponse.data ? timeTableResponse.data?.timetable_items.map(item => {
        const beginTime = parseISO(item.begin); // Parse the begin time into a Date object
        const endTime = parseISO(item.end); // Parse the end time into a Date object

        const day = getDay(beginTime); // Get the day of the week (0 = Sunday, 1 = Monday, etc.)

        const startHour = beginTime.getHours() * 4 + Math.floor(beginTime.getMinutes() / 15); // Extract the hour from begin time
        const endHour = endTime.getHours() * 4 + Math.floor(beginTime.getMinutes() / 15); // Extract the hour from end time

        return {
            start: startHour,
            end: endHour,
            day: day,
            name: 'hello',
        };
    }) : [];

    if(timeTableResponse.error){
        return(
            <div>Error</div>
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

    return(
        <div>
            <WeekSelector onWeekChange={handleWeekChange}/>
            <TimeTable blocks={block} state={schedulerState} setSchedulerState={SetSchedulerStateFunc} editBlock={editBlock} setEditBlock={setEditBlock}/>
            {schedulerState == SchedulerState.default &&
                <button onClick={() => SetSchedulerStateFunc(SchedulerState.createNewEvent)}>New Meeting</button>
            }
            {schedulerState == SchedulerState.editNewEvent &&
                <>
                    <p>Start: </p>
                    <TimeSelector default_time={editBlock ? editBlock.start * 15 : 0} on_change={HandleStartChange}/>
                    <p>End: </p>
                    <TimeSelector default_time={editBlock ? editBlock.end * 15 : 0} on_change={HandleEndChange}/>
                    <p></p>
                    <button onClick={() => SetSchedulerStateFunc(SchedulerState.default)}>Done</button>
                </>
            }
        </div>
    );
};

export default Scheduler;