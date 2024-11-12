import React, { useState, useEffect } from 'react';
import useFetchData from './useFetchData';

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
                {filteredBeers?.map((beer) => (
                    <li key={beer.id}>{beer.name} | {beer.degree} | {beer.info}</li>
                ))}
            </ul>
        </div>
    );
};

export default Beers;