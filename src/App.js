import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Info from './components/Info';
import Taskboard from './components/Taskboard';
import TotalActivity from './components/TotalActivity';
import DailyActivityChart from './components/DailyActivityChart';
import './App.css';
import './index.css';
import axios from 'axios';
import DetailedActivity from './components/DetailedActivity';

function App() {
  const URL = 'https://task-manager-appl-5871d2ece47c.herokuapp.com';
  const [isSettingsShow, setIsSettingsShow] = useState(false);
  const dropdownRef = useRef(null);
  const [mode, setMode] = useState('default');

  useEffect(() => {
    const showHandler = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSettingsShow(false);
      }
    };

    document.addEventListener('mousedown', showHandler);

    return () => {
      document.removeEventListener('mousedown', showHandler);
    };
  }, []);

  const [theme, setTheme] = useState('light');

  useEffect(() => {
    axios
      .get(`${URL}/theme`)
      .then((response) => {
        const theme = response.data.current;
        setTheme(theme);
        applyTheme(theme);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const applyTheme = (theme) => {
    document.body.className = theme;
  };
  const handleChangeTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
    axios
      .patch(`${URL}/theme`, { current: newTheme })
      .then((response) => {
        console.log('Theme changed');
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    // Fetch mode from API when component mounts
    fetch(`${URL}/mode`)
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched Mode:', data);
        setMode(data.current || 'default'); // set to default if no mode is stored
      })
      .catch((error) => console.error('Error fetching mode:', error));
  }, []);

  const toggleMode = () => {
    const newMode = mode === 'default' ? 'single' : 'default';
    setMode(newMode);

    fetch(`${URL}/mode`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current: newMode }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Mode saved:', data);
      })
      .catch((error) => console.error('Error saving mode:', error));
  };
  return (
    <BrowserRouter>
      <div>
        <div className='container'>
          <nav className='menu'>
            <ul className='menu__list'>
              <li>
                <Link to='/info' className='menu__link'>
                  Info
                </Link>
              </li>
              <li>
                <Link to='/taskboard' className='menu__link'>
                  Taskboard
                </Link>
              </li>
              <li>
                <div className='menu__link-wrapper'>
                  <Link to='/statistics' className='menu__link'>
                    Statistics
                  </Link>
                  <div className='statistics-dropdown' ref={dropdownRef}>
                    <li>
                      <Link
                        to='/statistics/total-activity'
                        className='menu__link sublink'
                      >
                        Total Activity
                      </Link>
                    </li>
                    <li>
                      <Link
                        to='/statistics/detailed-activity'
                        className='menu__link sublink'
                      >
                        Detailed Activity
                      </Link>
                    </li>
                    <li>
                      <Link
                        to='/statistics/detailed-activity-chart'
                        className='menu__link sublink'
                      >
                        Activity Chart
                      </Link>
                    </li>
                  </div>
                </div>
              </li>
              <li>
                <Link to='/settings' className='menu__link'>
                  Settings
                </Link>
                <ul className='settings-dropdown' ref={dropdownRef}>
                  <li>
                    <span className='menu__link sublink sublink-theme'>
                      Dark Theme
                      <label className='toggle-switch'>
                        <input
                          type='checkbox'
                          className='toggle-input'
                          checked={theme === 'dark'}
                          onChange={handleChangeTheme}
                        />
                        <span className='toggle-slider'></span>
                      </label>
                    </span>
                  </li>
                  <li>
                    <span className='menu__link sublink'>
                      Mode: {mode}
                      <label className='toggle-switch'>
                        <input
                          type='checkbox'
                          className='toggle-input'
                          checked={mode === 'single'}
                          onChange={toggleMode}
                        />
                        <span className='toggle-slider'></span>
                      </label>
                    </span>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
        </div>

        <Routes>
          <Route path='/info' element={<Info />} />
          <Route
            path='/taskboard'
            element={<Taskboard mode={mode} setMode={setMode} />}
          />
          <Route
            path='/statistics/total-activity'
            element={<TotalActivity />}
          />
          <Route
            path='/statistics/detailed-activity'
            element={<DetailedActivity />}
          />
          <Route
            path='/statistics/detailed-activity-chart'
            element={<DailyActivityChart />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
