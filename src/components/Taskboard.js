import React, { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';
import Task from './Task';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

//Taskboard component that displays and manages tasks and tags
//It allows users to add, edit, delete, and filter tasks as well as add and delete tags
//Supports drag-and-drop functionality for tasks ordering

const Taskboard = ({ mode, setMode }) => {
  const URL = 'https://task-manager-appl-5871d2ece47c.herokuapp.com';
  // State management for tasks and task editing
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedTagsForFilter, setSelectedTagsForFilter] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTaskName, setEditedTaskName] = useState('');
  const [showTagWarning, setShowTagWarning] = useState(false);
  const [tasksWithWarnings, setTasksWithWarnings] = useState(new Set());

  // Converts tags to a format suitable for the react-select component
  const tagOptions = tags.map((tag) => ({
    value: tag.name,
    label: tag.name,
  }));
  const selectedTagValues = selectedTags.map((tag) => ({
    value: tag,
    label: tag,
  }));

  // Handles tag selection change from the react-select component
  const handleTagChange = (selectedOptions) => {
    setSelectedTags(selectedOptions.map((opt) => opt.value));
  };

  // Handles the creation of a new tag
  const handleCreateOption = (inputValue) => {
    const newTagName = inputValue;

    const tagExists = tags.some((tag) => tag.name === newTagName);
    if (tagExists) return;

    fetch(`${URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTagName }),
    })
      .then((response) => response.json())
      .then((data) => {
        setTags((prevTags) => [...prevTags, data]);
        setSelectedTags((prevSelected) => [...prevSelected, newTagName]);
      })
      .catch((error) => console.error('Error adding new tag:', error));
  };

  useEffect(() => {
    fetch(`${URL}/tasks`)
      .then((response) => response.json())
      .then((data) => {
        data.map((task) => {
          if (task.isActive) {
            const lastIntervalIndex = task.activityIntervals.length - 1;
            const lastInterval = task.activityIntervals[lastIntervalIndex];
            lastInterval.end = new Date().toISOString();
          }
          return task;
        });
        setTasks(Array.isArray(data) ? data : []);
      });

    fetch(`${URL}/tags`)
      .then((response) => response.json())
      .then((data) => {
        setTags(Array.isArray(data) ? data : []);
      });
  }, []);

  // Handles the addition of a new task
  const addTask = () => {
    if (selectedTags.length === 0) {
      setShowTagWarning(true);
      return;
    }
    setShowTagWarning(false);
    if (newTask.trim()) {
      const task = {
        name: newTask,
        tags: selectedTags,
        isActive: false,
        activityIntervals: [],
      };

      fetch(`${URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      })
        .then((response) => response.json())
        .then((data) => {
          setTasks((prevTasks) => [...prevTasks, data]);

          setNewTask('');
          setSelectedTags([]);
        })
        .catch((error) => console.error('Error adding new task:', error));
    }
  };

  //Handles the switching to activity of single task
  const toggleTaskActivity = async (taskId) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      if (mode === 'single' && !task.isActive) {
        // Inactivate all other tasks
        for (const t of tasks) {
          if (t.id !== taskId && t.isActive) {
            await toggleTaskActivity(t.id);
          }
        }
      }

      const newTask = { ...task, isActive: !task.isActive };
      const now = new Date();
      const timezoneOffset = now.getTimezoneOffset() * 60000;
      const localISOTime = new Date(now - timezoneOffset).toISOString();
      if (newTask.isActive) {
        newTask.activityIntervals.push({ start: localISOTime, end: null });
      } else {
        const lastIntervalIndex = newTask.activityIntervals.length - 1;
        newTask.activityIntervals[lastIntervalIndex].end = localISOTime;
      }

      // Update task in API
      await fetch(`${URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });

      // Update local state only after API update is successful
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? newTask : task))
      );
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  // Handles the task's editing
  const EditTaskName = (taskId) => {
    const taskToEdit = tasks.find((task) => task.id === taskId);
    setEditedTaskName(taskToEdit.name);
    setEditingTaskId(taskId);
  };

  // Handles edited task name's saving
  const saveEditedTaskName = (taskId) => {
    const updatedTask = tasks.find((task) => task.id === taskId);
    updatedTask.name = editedTaskName;

    fetch(`${URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTask),
    }).then(() => {
      // Update local state after successful API update
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, name: editedTaskName } : task
        )
      );
      setEditingTaskId(null);
      setEditedTaskName('');
    });
  };

  // Handles task deletion
  const deleteTask = (id) => {
    fetch(`${URL}/tasks/${id}`, { method: 'DELETE' }).then(() =>
      setTasks(tasks.filter((task) => task.id !== id))
    );
  };

  // Handles tag ddeletion
  const deleteTag = (taskId, tagToDelete) => {
    const task = tasks.find((task) => task.id === taskId);
    if (!task) return;
    const updatedTags = task.tags.filter((tag) => tag !== tagToDelete);

    if (updatedTags.length === 0) {
      setTasksWithWarnings((prev) => new Set([...prev, taskId]));
      return;
    }

    setTasksWithWarnings((prev) => {
      const newWarnings = new Set(prev);
      newWarnings.delete(taskId);
      return newWarnings;
    });

    const updatedTask = { ...task, tags: updatedTags };
    setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)));
    // Update the task in the database
    fetch(`${URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTask),
    });
  };

  //Handles tags addition to tasks in task list
  const addTagToTask = (taskId, tagName) => {
    const task = tasks.find((task) => task.id === taskId);
    if (!task) return;

    const updatedTags = [...new Set([...task.tags, tagName])];

    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === taskId ? { ...t, tags: updatedTags } : t))
    );

    fetch(`${URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...task, tags: updatedTags }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .catch((error) => {
        console.error('Error updating tags:', error);
      });
  };

  // Handles tasks filtering
  const filteredTasks = tasks.filter((task) =>
    selectedTagsForFilter.every((tag) => task.tags.includes(tag))
  );

  //Handler for drag end event when reordering tasks
  const onDragEnd = (result) => {
    const { destination, source } = result;

    if (!destination) {
      console.log('No destination');
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newTasks = Array.from(tasks);
    const [removed] = newTasks.splice(source.index, 1);
    newTasks.splice(destination.index, 0, removed);

    setTasks(newTasks);
  };

  return (
    <div className='taskboard'>
      <div className='taskboard__actions'>
        <div className='actions__add'>
          <input
            className='add__input'
            type='text'
            placeholder='Enter new task...'
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />

          <div className='actions__add-tags'>
            <CreatableSelect
              isMulti
              name='tags'
              options={tagOptions}
              className='basic-multi-select'
              classNamePrefix='select'
              value={selectedTagValues}
              onChange={handleTagChange}
              onCreateOption={handleCreateOption}
              placeholder='Select or create a tag...'
            />
          </div>
          <button className='btn__add-task' onClick={addTask}>
            Add Task
          </button>
          {showTagWarning && (
            <p className='add-task__warning'>
              Please select at least one tag before adding a task!
            </p>
          )}
        </div>
        <div className='actions__filter'>
          <CreatableSelect
            isMulti
            name='filter-tags'
            options={tagOptions}
            className='basic-multi-select'
            classNamePrefix='select'
            value={selectedTagsForFilter.map((tag) => ({
              value: tag,
              label: tag,
            }))}
            onChange={(selectedOptions) =>
              setSelectedTagsForFilter(selectedOptions.map((opt) => opt.value))
            }
            placeholder='Filter by tags...'
          />
        </div>
      </div>

      <div className='taskboard__task-list'>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId='droppable'>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {filteredTasks.map((task, index) => (
                  <Draggable
                    key={task.id}
                    draggableId={String(task.id)}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <Task
                          key={task.id}
                          task={task}
                          onToggleTaskActivity={toggleTaskActivity}
                          onEditTaskName={EditTaskName}
                          onDeleteTask={deleteTask}
                          onSaveEditedTaskName={saveEditedTaskName}
                          onDeleteTag={deleteTag}
                          editingTaskId={editingTaskId}
                          editedTaskName={editedTaskName}
                          setEditedTaskName={setEditedTaskName}
                          onAddTag={addTagToTask}
                          setTasks={setTasks}
                          setTags={setTags}
                          tags={tags}
                          handleCreateOption={handleCreateOption}
                          tasksWithWarnings={tasksWithWarnings}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};
export default Taskboard;
