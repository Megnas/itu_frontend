//Projekt ITU - Pivní Plánovač
//Autor: Dominik Václavík

import React, { useState, useEffect } from 'react';
import useFetchData from './useFetchData';
import './Pubs.css'
import formatUrl from './FormatURL';
import usePostRequest from './usePostRequest';
import useDeleteRequest from './useDeleteRequest';

interface Pub {
    id: number;
    name: string;
    address: string;
    blacklisted_users: number[];
}

interface PubList{
    pubs: Pub[];
}

interface UserData{
    id: number;
}

const Pubs: React.FC<UserData> = ({ id }) => {
    //const blacklistUrl = formatUrl("/user_pub_blacklist", { user_id : id });
    //const blacklisted = useFetchData<PubList>(blacklistUrl);
    const [filter, setFilter] = useState<string>("");
    const pubs = useFetchData<PubList>("/pub", [ filter ]);

    // Filter the beers based on the input value
    const filteredPubs = pubs.data?.pubs.filter((beer) =>
        beer.name.toLowerCase().includes(filter.toLowerCase())
    );

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilter(event.target.value);
    };

    if (pubs.error) {
        return <div>Error: {typeof pubs.error === "string" ? pubs.error : "Error fetching data"}</div>;
    }

    return(
        <div>
            <h1>Pubs</h1>
            <input
                type="text"
                placeholder="Filter by name"
                value={filter}
                onChange={handleInputChange}
                style={{ marginBottom: '20px', padding: '8px', fontSize: '16px' }} />
            <p>Loading: {pubs.loading ? "Loading" : "Done"}</p>
            <ul>
                {pubs.loading ? 
                    <li>Loading</li>
                    :
                    <>
                    {filteredPubs?.map((pub) => (
                        <PubInstance pub={pub} id={id} />
                    ))}
                    </>
                }
            </ul>
        </div>
    );
};

const PubInstance: React.FC<{ pub: Pub, id : number }> = ({ pub, id }) => {
    const [isEnabled, setisEnabled] = useState(false);
    const [wantMore, setWantMore] = useState(false);

    const postRequest = usePostRequest("/user_pub_blacklist");
    const deleteRequest = useDeleteRequest("/user_pub_blacklist");

    const handleEnable = () => {
        setisEnabled((isEnabled) => !isEnabled);
        if(isEnabled){
            //Delete Here
            deleteRequest.handleDelete(`/${id}/${pub.id}`);
        }
        else {
            //Post here
            postRequest.sendPostRequest({user_id: id, pub_id: pub.id})
        }
    };

    const handleMore = () => {
        setWantMore((wantMore) => !wantMore);
    };

    useEffect(() => {
        // Check if the user ID 1 is in the blacklist on initial render or if pub changes
        if (pub.blacklisted_users.includes(id)) {
            setisEnabled(true);
        }
    }, [pub, id]);

    return(
        <li key={pub.id} className='pub-holder'>
            <div className='pub-instance'>
                <div className='column'>{pub.name}</div>
                <button 
                    onClick={handleEnable} 
                    className={isEnabled ? "enabled" : "disabled"}
                >
                    {isEnabled ? "Allow" : "Prohibit"}
                </button>
                <button onClick={handleMore}>{wantMore ? "Hide" : "More"}</button>
            </div>
            {wantMore && 
                <div>
                    <h3>Address:</h3>
                    <p>{pub.address}</p>
                </div>
            }
        </li>
    );
};

export default Pubs;