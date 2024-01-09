import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

//DetailedActivity component allows display activity intervals
//for choosen tags as well as add and delete them
const DetailedActivity = () => {
  const URL = 'https://task-manager-appl-5871d2ece47c.herokuapp.com/api';
  // State for storing the list of tasks
  const [tasks, setTasks] = useState([]);

  // Effect hook to fetch tasks data from the server when the component mounts
  useEffect(() => {
    axios
      .get(`${URL}/tasks`)
      .then((response) => {
        setTasks(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  // Format date into readable string
  const formatDate = (date) => {
    const d = new Date(date);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'UTC',
    }).format(
      Date.UTC(
        // Creating a UTC date for formatting
        d.getUTCFullYear(),
        d.getUTCMonth(),
        d.getUTCDate(),
        d.getUTCHours(),
        d.getUTCMinutes(),
        d.getUTCSeconds()
      )
    );
  };
  // State to force component updates
  const [updateKey, setUpdateKey] = useState(0);
  // States for handling UI logic and storing user input
  const [selectedTask, setSelectedTask] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [activityIntervals, setActivityIntervals] = useState([]);
  const [error, setError] = useState(null);
  const [showIntervals, setShowIntervals] = useState(false);

  // Effect hook that filters activity intervals based on selected date interval
  useEffect(() => {
    if (selectedTask) {
      const intervals = selectedTask.activityIntervals.filter((interval) => {
        const localStartDate = new Date(startDate);
        localStartDate.setMinutes(
          localStartDate.getMinutes() - localStartDate.getTimezoneOffset()
        );
        const localEndDate = new Date(endDate);
        localEndDate.setMinutes(
          localEndDate.getMinutes() - localEndDate.getTimezoneOffset()
        );
        return (
          new Date(interval.start) >= localStartDate &&
          new Date(interval.end) <= localEndDate
        );
      });
      setActivityIntervals(intervals);
    }
  }, [selectedTask, startDate, endDate]);

  const handleShowIntervals = () => {
    setShowIntervals(true);
  };

  const handleTaskChange = (selectedOption) => {
    const task = tasks.find((t) => t.id === selectedOption.value);
    setSelectedTask(task);
  };

  const handleStartChange = (index, date) => {
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    const newIntervals = [...activityIntervals];
    newIntervals[index].start = date.toISOString();
    setActivityIntervals(newIntervals);
  };

  const handleEndChange = (index, date) => {
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    const newIntervals = [...activityIntervals];
    newIntervals[index].end = date.toISOString();
    setActivityIntervals(newIntervals);
  };

  //Save changes to the server
  const handleSave = async () => {
    if (selectedTask) {
      const updatedTask = {
        ...selectedTask,
        activityIntervals,
      };
      try {
        await axios.put(`{URL}/tasks/${selectedTask.id}`, updatedTask);
        setError(null);
        setUpdateKey((prev) => prev + 1);
        window.alert('Changes have been saved successfully!');
      } catch (error) {
        setError('Failed to save the task');
      }
    }
  };
  // Modify the activity intervals state
  const handleAddInterval = () => {
    const newIntervals = [
      ...activityIntervals,
      {
        start: new Date().toISOString(),
        end: new Date().toISOString(),
      },
    ];
    setActivityIntervals([...newIntervals]);
    setUpdateKey((prev) => prev + 1);
  };

  const handleRemoveInterval = (index) => {
    const newIntervals = [...activityIntervals];
    newIntervals.splice(index, 1);
    setActivityIntervals(newIntervals);
  };
  const taskOptions = tasks
    ? tasks.map((task) => ({
        value: task.id,
        label: task.name,
      }))
    : [];
  return (
    <div className='container'>
      <div className='detailed-activity'>
        <div className='detailed-activity__task-selector'>
          <Select
            options={taskOptions}
            onChange={handleTaskChange}
            placeholder='Select a task...'
          />
        </div>

        <div className='detailed-activity__intervals intervals'>
          <p className='intervals__select'>Select activity intervals</p>
          <div className='intervals__container'>
            <div className='intervals__date-selector'>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat='dd/MM/yyyy HH:mm'
                className='custom-datepicker'
                showTimeSelect
                timeFormat='HH:mm'
                timeIntervals={15}
              />{' '}
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                dateFormat='dd/MM/yyyy HH:mm'
                className='custom-datepicker'
                showTimeSelect
                timeFormat='HH:mm'
                timeIntervals={15}
              />
            </div>
            <button
              className='intervals__confirm-btn btn'
              onClick={handleShowIntervals}
            >
              Confirm
            </button>
            <button
              className='btn__add-interval btn'
              onClick={handleAddInterval}
            >
              Add interval
            </button>
          </div>
          {showIntervals && (
            <div className='activity-intervals'>
              <ul>
                {' '}
                {activityIntervals.length > 0 ? (
                  activityIntervals.map((interval, index) => (
                    <li className='intervals__text ' key={index}>
                      <span className='intervals__text-start'>Start</span>
                      <DatePicker
                        selected={new Date(formatDate(interval.start))}
                        onChange={(date) => handleStartChange(index, date)}
                        selectsStart
                        startDate={new Date(interval.start)}
                        endDate={new Date(interval.end)}
                        dateFormat='dd/MM/yyyy HH:mm'
                        showTimeSelect
                        className='custom-datepicker'
                        timeFormat='HH:mm'
                        timeIntervals={15}
                      />
                      <span className='intervals__text-end'>End</span>
                      <DatePicker
                        selected={new Date(formatDate(interval.end))}
                        onChange={(date) => handleEndChange(index, date)}
                        selectsEnd
                        startDate={new Date(interval.start)}
                        endDate={new Date(interval.end)}
                        minDate={new Date(interval.start)}
                        dateFormat='dd/MM/yyyy HH:mm'
                        showTimeSelect
                        className='custom-datepicker'
                        timeFormat='HH:mm'
                        timeIntervals={15}
                      />
                      <button
                        className='btn btn__save-interval'
                        onClick={handleSave}
                      >
                        Save
                      </button>
                      <button
                        className='btn btn__delete-interval'
                        onClick={() => handleRemoveInterval(index)}
                      >
                        Delete
                      </button>
                    </li>
                  ))
                ) : (
                  <li className='activity-intervals__no-itervals'>
                    No activity intervals
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default DetailedActivity;
