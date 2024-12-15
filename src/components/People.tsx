//Projekt ITU - Pivní Plánovač
//Autor: Dominik Václavík


import React, { useState, useEffect } from 'react';
import useFetchData from './useFetchData';
import './People.css';
import usePutRequest from './usePutRequest';
import usePutRequestCnst from './usePutRequestCnst';
import useDeleteRequest from './useDeleteRequest';

interface User {
    id: number;
    username: string;
}

interface UserList {
    users: User[];
}

interface UserData{
    id: number;
}

interface MeetingItem {
    id: number;
    pub_id: number;
    owner_id: number;
    begin: string;
    end: string;
    user: number [];
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

const People: React.FC<UserData> = ({id}) => {
    const [filter, setFilter] = useState<string>("");

    const putRequest = usePutRequestCnst(`/meeting_participant`);
    const deleteRequest = useDeleteRequest(`/meeting_participant`);

    const users = useFetchData<UserList>("/user");
    const meetings = useFetchData<MeetingResponse>(`/meeting?owner_id=${id}`);
    const pubs = useFetchData<PubList>("/pub");

    const pubDict = pubs.data ? transformToIdNameDict(pubs.data) : {};

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilter(event.target.value);
    };

    const filteredUsers = users.data?.users.filter((user) =>
        user.username.toLowerCase().includes(filter.toLowerCase())
    );

    if (users.error) {
        return <div>Error: {typeof users.error === "string" ? users.error : "Error fetching data"}</div>;
    }

    const buttonCallback = (meet_id: number, user_id: number, in_list: boolean) => {
        if(in_list){
            deleteRequest.handleDelete(`/${user_id}/${meet_id}`);
        }
        else {
            putRequest.sendPutRequestCnst(`/${user_id}/${meet_id}`, {});
        }
    }
    
    return (
        <div>
            <h1>Users</h1>
            <input
                type="text"
                placeholder="Filter by name"
                value={filter}
                onChange={handleInputChange}
                style={{ marginBottom: '20px', padding: '8px', fontSize: '16px' }} />
            <p>Loading: {users.loading ? "Loading" : "Done"}</p>
            <ul>
                {filteredUsers?.map((user) => (
                    user.id != id && //Do not display current user
                    <UserInstance user={user} id={id} key={user.id} meeting={meetings.data? meetings.data.meetings : []} pubDict={pubDict} buttonCallback={buttonCallback}/>
                ))}
            </ul>
        </div>
    );
};

const UserInstance: React.FC<{
    user: User, 
    id: number, 
    meeting: MeetingItem[], 
    pubDict: { [key: number]: string }
    buttonCallback: (meet_id: number, user_id: number, in_list: boolean) => void
}> = ({user, id, meeting, pubDict, buttonCallback}) => {
    const [wantMore, setWantMore] = useState(false);

    const handleMore = () => {
        setWantMore((wantMore) => !wantMore);
    };

    return(
        <li className='user-holder'>
            <div className='user-instance'>
                <div className='column'>{user.username}</div>
                <button onClick={handleMore}>{wantMore ? "Hide" : "Invite"}</button>
            </div>
            {wantMore &&
                <div>
                    {meeting.map((meet) => (
                        <MeetInstance meet={meet} key={meet.id} pubDict={pubDict} user={user} buttonCallback={buttonCallback}/>
                    ))}
                </div>
            }
        </li>
    );
}

const MeetInstance: React.FC<{
    meet: MeetingItem, 
    pubDict: { [key: number]: string }, 
    user: User,
    buttonCallback: (meet_id: number, user_id: number, in_list: boolean) => void
}> = ({meet, pubDict, user, buttonCallback}) => {
    const [isInList, SetInList] = useState(meet.user.indexOf(user.id) !== -1);

    const callBackFunction = () => {
        SetInList(!isInList);
        buttonCallback(meet.id, user.id, isInList);
    }

    return(
        <li>
            <p>{pubDict[meet.pub_id]}</p> <p>{meet.begin} - {meet.end}</p> <button onClick={callBackFunction}> {isInList ? "Remove" : "Add"} </button>
        </li>
    );
}

export default People;