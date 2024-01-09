import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

//Calculates total active time within given intervals
const calculateActiveTimeWithinInterval = (intervals) => {
  return intervals.reduce((acc, { start, end }) => {
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : new Date().getTime();
    const activeTimeInMilliseconds = endTime - startTime;
    const activeTimeInMinutes = activeTimeInMilliseconds / 60000;
    const roundedActiveTime = Math.round(activeTimeInMinutes);
    return acc + roundedActiveTime;
  }, 0);
};

//TotalActivity component that calculates and displays
//total activity time of the tasks and tags in choosen interval
const TotalActivity = () => {
  const URL = 'https://task-manager-appl-5871d2ece47c.herokuapp.com';
  // State hooks for defining the observation start and end times
  const [observationStart, setObservationStart] = useState(
    new Date().setHours(0, 0, 0, 0)
  );
  const [observationEnd, setObservationEnd] = useState(new Date().getTime());
  const [tasks, setTasks] = useState([]);
  const [tags, setTags] = useState([]);
  const [showActivityTime, setShowActivityTime] = useState(false);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);

  // Function to filter tasks and tags based on the observation period and set them in state
  const handleConfirmButtonClick = () => {
    setShowActivityTime(true);

    const tasksOfInterest = tasks.filter((task) =>
      task.activityIntervals.some((interval) => {
        const intervalStart = new Date(interval.start).getTime();
        const intervalEnd = interval.end
          ? new Date(interval.end).getTime()
          : new Date().getTime();
        const observationStartUTCInMilliseconds = new Date(
          observationStartUTC
        ).getTime();
        const observationEndUTCInMilliseconds = new Date(
          observationEndUTC
        ).getTime();

        return (
          intervalStart <= observationEndUTCInMilliseconds &&
          intervalEnd >= observationStartUTCInMilliseconds
        );
      })
    );

    const tagsOfInterest = tags.filter((tag) =>
      tasksOfInterest.some((task) => task.tags.includes(tag.name))
    );

    setFilteredTasks(tasksOfInterest);
    setFilteredTags(tagsOfInterest);
  };

  // Fetch tasks and tags data on component mount
  useEffect(() => {
    fetch(`${URL}/tasks`)
      .then((response) => response.json())
      .then((data) => {
        setTasks(Array.isArray(data) ? data : []);
      });

    fetch(`${URL}/tags`)
      .then((response) => response.json())
      .then((data) => {
        setTags(Array.isArray(data) ? data : []);
      });
  }, []);

  // Convert local date/time to UTC
  const localToUTC = (date) => {
    const localDate = new Date(date);
    const offset = localDate.getTimezoneOffset();
    const utcDate = new Date(localDate.getTime() - offset * 60 * 1000);
    return utcDate.toISOString();
  };

  // Calculate the observation period in UTC
  const observationStartUTC = localToUTC(observationStart);
  const observationEndUTC = localToUTC(observationEnd);

  return (
    <div className='container'>
      <div className='total-activity'>
        <div className='total-activity__dates'>
          <div>
            <label className='total-activity__dates-name'>Start</label>
            <DatePicker
              selected={new Date(observationStart)} // Convert to Date object
              onChange={(date) => setObservationStart(date)}
              showTimeSelect
              timeFormat='HH:mm'
              timeIntervals={1}
              dateFormat='dd-MM-yyyy HH:mm'
              className='custom-datepicker'
              popperPlacement='bottom-start'
            />
          </div>
          <div>
            <label className='total-activity__dates-name end'>End</label>
            <DatePicker
              selected={new Date(observationEnd)} // Convert to Date object
              onChange={(date) => setObservationEnd(date)}
              showTimeSelect
              timeFormat='HH:mm'
              timeIntervals={1}
              dateFormat='dd-MM-yyyy HH:mm'
              className='custom-datepicker'
              popperPlacement='bottom-start'
            />
          </div>
          <button
            className='button btn__total-activity-confirm'
            onClick={handleConfirmButtonClick}
          >
            Confirm
          </button>
        </div>
        {showActivityTime && (
          <div className='total-activity__summary'>
            <div className='total-activity__summary-tasks'>
              <div className='total-activity__summary-name'>
                Tasks total active time
              </div>

              <ul className='total-activity__list'>
                {filteredTasks.map((task) => (
                  <li key={task.id} className='total-activity__list-item'>
                    <span className='list-item__name'>{task.name}:</span>
                    {calculateActiveTimeWithinInterval(
                      task.activityIntervals
                    )}{' '}
                    minutes
                  </li>
                ))}
              </ul>
            </div>
            <div className='total-activity__summary-tags'>
              <div className='total-activity__summary-name summary-name__tags'>
                Tags total active time
              </div>
              <ul className='total-activity__list'>
                {filteredTags.map((tag) => {
                  const relevantTasks = filteredTasks.filter((task) =>
                    task.tags.includes(tag.name)
                  );
                  const totalActiveTime = relevantTasks.reduce(
                    (acc, task) =>
                      acc +
                      calculateActiveTimeWithinInterval(task.activityIntervals),
                    0
                  );
                  return (
                    <li key={tag.id} className='total-activity__list-item'>
                      <span className='list-item__name'>{tag.name}:</span>
                      {totalActiveTime} minutes
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TotalActivity;
