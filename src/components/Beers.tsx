//Projekt ITU - Pivní Plánovač
//Autor: Dominik Václavík

import React, { useState, useEffect } from 'react';
import useFetchData from './useFetchData';
import StarRating from './StarRating';
import './Beers.css'

interface Beer {
    id: number;
    name: string;
    degree: number;
    info: string;
}

interface BeerList {
    beers: Beer[];
}

const Beers: React.FC = () => {
    const { data, loading, error } = useFetchData<BeerList>("/beer");
    const [filter, setFilter] = useState<string>("");

    // Filter the beers based on the input value
    const filteredBeers = data?.beers.filter((beer) =>
        beer.name.toLowerCase().includes(filter.toLowerCase())
    );

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilter(event.target.value);
    };


    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {typeof error === "string" ? error : "Error fetching data"}</div>;
    }

    return (
        <div>
            <h1>Beers</h1>
            <input
                type="text"
                placeholder="Filter by name"
                value={filter}
                onChange={handleInputChange}
                style={{ marginBottom: '20px', padding: '8px', fontSize: '16px' }}
            />
            <ul>
            <li key={-1} className='beer-holder'>
                <div className='beer-instance'>
                    <div className='column' style={{textAlign: "center"}}> Name </div>
                    <div className='column' style={{textAlign: "center"}}> Degree  </div>
                    <div className='column' style={{textAlign: "center"}}> Rating  </div>
                </div>
                
            </li>
                {filteredBeers?.map((beer) => (
                    <BeerInstance beer={beer}/>
                ))}
            </ul>
        </div>
    );
};

const BeerInstance: React.FC<{beer: Beer}> = ({ beer }) => {
    const [wantMore, setWantMore] = useState(false);

    const handleMore = () => {
        setWantMore((wantMore) => !wantMore);
    };

    return(
        <li key={beer.id} className='beer-holder'>
            <div className='beer-instance'>
                <div className='column'> {beer.name} </div>
                <div className='column'> {beer.degree} </div>
                <StarRating onRatingChange={function (rating: number): void {
                    
                } }/>
                <button onClick={handleMore}>{wantMore ? "Hide" : "More"}</button>
            </div>
            {wantMore &&
                <div className='beer-instance'>
                    <div className='column'> {beer.info} </div>
                </div>
            }
        </li>
    );
}

export default Beers;