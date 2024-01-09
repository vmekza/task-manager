import React from 'react';

//Info component displaying instruction for using the app
const Info = () => {
  return (
    <div className='container'>
      <div className='info'>
        <p className='info__author info__bold'>
          The author: Ekaterina Zavyalova
        </p>
        <ul className='info__list'>
          <span className='info__list-name info__bold'>
            Instructions for using application
          </span>
          <li>
            In <span className='info__bold'>Taskboard</span> view a user can
            create tasks, tags and filter tasks. Newly added tasks are gray,
            indicating they are inactive. Clicking the play icon activates them,
            turning tasks green. Clicking the pause icon deactivates tasks. By
            utilizing different icons the user can edit and delete tasks as well
            as add and delete tags.
          </li>
          <li>
            In <span className='info__bold'>Statistics</span> view user can
            check total activity time for tasks and tags separetely, detailed
            activity for choosen task and see bar chart for choosen task in
            choosen time interval.
          </li>
          <li>
            In <span className='info__bold'>Setting</span> view a user can
            change theme to dark and default mode to "single" when only one task
            is active.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Info;
