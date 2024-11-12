import React, { useState, useEffect } from 'react';
import useFetchData from './useFetchData';
import './People.css';

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

const People: React.FC<UserData> = ({id}) => {
    const [filter, setFilter] = useState<string>("");
    const users = useFetchData<UserList>("/user");

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilter(event.target.value);
    };

    const filteredUsers = users.data?.users.filter((user) =>
        user.username.toLowerCase().includes(filter.toLowerCase())
    );

    if (users.error) {
        return <div>Error: {typeof users.error === "string" ? users.error : "Error fetching data"}</div>;
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
                    <UserInstance user={user} id={id}/>
                ))}
            </ul>
        </div>
    );
};

const UserInstance: React.FC<{user: User, id: number}> = ({user, id}) => {
    const [wantMore, setWantMore] = useState(false);

    const handleMore = () => {
        setWantMore((wantMore) => !wantMore);
    };

    return(
        <li key={user.id} className='user-holder'>
            <div className='user-instance'>
                <div className='column'>{user.username}</div>
                <button onClick={handleMore}>{wantMore ? "Hide" : "Invite"}</button>
            </div>
            {wantMore &&
                <div>
                    <p>More</p>
                </div>
            }
        </li>
    );
}

export default People;