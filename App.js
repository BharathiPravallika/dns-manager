import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './components/styles/App.css';
import Home from './components/Dashboard/Home'
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" Component={Register} />
          <Route exact path='/register' Component={Register} />
          <Route exact path='/login' Component={Login} />
          <Route exact path='/home' Component={Home} />
        </Routes>
      </Router>

    </div>
  );
}

export default App;
