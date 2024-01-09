import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';

const DailyActivityChart = () => {
  const URL = 'https://task-manager-appl-5871d2ece47c.herokuapp.com';
  const [tasks, setTasks] = useState([]);

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
  const [selectedTask, setSelectedTask] = useState(null);
  const [chartStartDate, setChartStartDate] = useState(new Date());
  const [chartEndDate, setChartEndDate] = useState(new Date());
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [showChart, setShowChart] = useState(false);

  const [confirmedChartStartDate, setConfirmedChartStartDate] = useState(
    new Date()
  );
  const [confirmedChartEndDate, setConfirmedChartEndDate] = useState(
    new Date()
  );

  useEffect(() => {
    if (selectedTask) {
      const startDateTime = new Date(confirmedChartStartDate);
      startDateTime.setHours(0, 0, 0, 0);

      const endDateTime = new Date(confirmedChartEndDate);
      endDateTime.setHours(23, 59, 59, 999);

      const filteredIntervals = selectedTask.activityIntervals.filter(
        (interval) =>
          new Date(interval.start) >= startDateTime &&
          new Date(interval.end) <= endDateTime
      );

      const dailySums = {};
      filteredIntervals.forEach((interval) => {
        const start = new Date(interval.start);
        const end = new Date(interval.end);
        const day = start.toISOString().split('T')[0];
        const duration = (end - start) / 1000 / 60; // convert duration to hours
        if (!dailySums[day]) {
          dailySums[day] = 0;
        }
        dailySums[day] += duration;
      });

      const labels = Object.keys(dailySums);
      const data = Object.values(dailySums);

      const newChartData = {
        labels,
        datasets: [
          {
            label: `Daily activity for ${selectedTask.name}`,
            data,
            backgroundColor: 'rgba(0,255,0, 0.1)',
            borderColor: 'rgba(0,255,0, 0.3)',
            borderWidth: 1,
          },
        ],
      };

      setChartData(newChartData);
    }
  }, [selectedTask, confirmedChartStartDate, confirmedChartEndDate]);

  const handleTaskChange = (selectedOption) => {
    const task = tasks.find((t) => t.id === selectedOption.value);
    setSelectedTask(task);
  };

  const handleConfirm = () => {
    if (selectedTask && chartStartDate && chartEndDate) {
      setConfirmedChartStartDate(chartStartDate);
      setConfirmedChartEndDate(chartEndDate);
      setShowChart(true);
      setError(null); // clear the error state
    } else {
      setError('Please select a task and specify the chart dates!');
    }
  };

  const taskOptions = tasks
    ? tasks.map((task) => ({
        value: task.id,
        label: task.name,
      }))
    : [];

  return (
    <div className='container'>
      <div className='daily-chart'>
        <div className='daily-chart__task-selector'>
          <Select
            options={taskOptions}
            onChange={handleTaskChange}
            placeholder='Select a task...'
          />
        </div>
        <div className='daily-chart__date'>
          <DatePicker
            selected={chartStartDate}
            onChange={(date) => setChartStartDate(date)}
            selectsStart
            className='custom-datepicker chart__datepicker'
            startDate={chartStartDate}
            endDate={chartEndDate}
            dateFormat='dd/MM/yyyy '
          />
          <DatePicker
            selected={chartEndDate}
            onChange={(date) => setChartEndDate(date)}
            selectsEnd
            className='custom-datepicker chart__datepicker'
            startDate={chartStartDate}
            endDate={chartEndDate}
            minDate={chartStartDate}
            dateFormat='dd/MM/yyyy'
          />
          <button
            className='daily-chart__btn-confirm btn'
            onClick={handleConfirm}
          >
            Confirm
          </button>
        </div>

        {showChart && (
          <div className='daily-chart__chart'>
            {chartData.labels && chartData.labels.length > 0 ? (
              <Bar data={chartData} />
            ) : (
              <p className='chart-warning'>
                No data available for the selected dates
              </p>
            )}
          </div>
        )}
        {error && <div className='daily-chart__message'>{error}</div>}
      </div>
    </div>
  );
};

export default DailyActivityChart;
