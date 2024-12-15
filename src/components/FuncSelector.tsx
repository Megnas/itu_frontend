//Projekt ITU - Pivní Plánovač
//Autor: Dominik Václavík

import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import "./FuncSelector.css"

interface FuncSelectorObject {
    label: string
    component: React.ReactElement
}

interface FuncSelectorObjectDict {
    routes: { [key: string]: FuncSelectorObject };
}

const FuncSelector: React.FC<FuncSelectorObjectDict> = ({ routes }) => {
    return(
        <Router>
            <nav className="navbar">
                {Object.entries(routes).map(([route, { label, component }]) => (
                    <Link key={route} to={route} className="navbar-item">{label}</Link>
                ))}
            </nav>
            <div className="app-container">
            <Routes>
                {Object.entries(routes).map(([route, { label, component }]) => (
                    <Route path={route} element={component}/>
                ))}
            </Routes>
            </div>
        </Router>
    );
};

export default FuncSelector;