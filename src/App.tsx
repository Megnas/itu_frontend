//Projekt ITU - Pivní Plánovač
//Autor: Dominik Václavík

import React from 'react';
import logo from './logo.svg';
import './App.css';
import FuncSelector from "./components/FuncSelector"
import Scheduler from './components/Scheduler';
import People from './components/People';
import Pubs from './components/Pubs';
import Beers from './components/Beers';
import useFetchData from './components/useFetchData';

interface User {
  id: number;
  username: string;
  password_hash: string;
  blacklisted_pubs: number[];
  timetable: number[];
  meeting: number[];
}

interface ApiResponse {
  user: User;
}

function App() {
  const { data, loading, error } = useFetchData<ApiResponse>("/user?username=testuser"); //testuser //Sheila%20Myers

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
      return <div>Error: {typeof error === "string" ? error : "Error fetching data"}</div>;
  }

  console.log("Fetched data:", data);

  const routes = {
    "/" : {label: "Home", component: <div>Welcome to the App!</div>},
    "/calendar" : {label: "Calendar", component: <Scheduler id={data?.user.id ?? 0}/>},
    "/people" : {label: "People", component: <People id={data?.user.id ?? 0}/>},
    "/beers" : {label: "Beers", component: <Beers/>},
    "/pubs" : {label: "Pubs", component: <Pubs id={data?.user.id ?? 0}/>},
  }

  return (
    <div className="App">
      <FuncSelector routes = {routes}/>
    </div>
  );
}

export default App;
