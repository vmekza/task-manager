import React, { useState } from 'react';
import {
  FaTrashAlt,
  FaEdit,
  FaPlay,
  FaPause,
  FaSave,
  FaPlus,
} from 'react-icons/fa';
import TagEditor from './TagEditor';

// Handles rendering and managing a single task
const Task = ({
  task,
  onToggleTaskActivity,
  onEditTaskName,
  onDeleteTask,
  onSaveEditedTaskName,
  onDeleteTag,
  editingTaskId,
  editedTaskName,
  setEditedTaskName,
  tags,
  onAddTag,
  setTasks,
  setTags,
  tasksWithWarnings,
}) => {
  // State to manage the visibility of the TagEditor component
  const [isTagEditorOpen, setIsTagEditorOpen] = useState(false);

  // Handlers to open and close the TagEditor
  const handleTagEditorOpen = () => {
    setIsTagEditorOpen(true);
  };

  const handleTagEditorClose = () => {
    setIsTagEditorOpen(false);
  };

  return (
    <div className='task-list__container'>
      <div
        className={`task-list__task ${task.isActive ? 'active' : 'inactive'}`}
      >
        <div className='task__content'>
          <div className='task__content-text'>
            {editingTaskId === task.id ? (
              <>
                <input
                  className='task__content-text__edit'
                  type='text'
                  value={editedTaskName}
                  onChange={(e) => setEditedTaskName(e.target.value)}
                />
              </>
            ) : (
              task.name
            )}
          </div>

          {editingTaskId === task.id ? (
            <button
              className='task__content-save'
              onClick={() => onSaveEditedTaskName(task.id)}
            >
              <FaSave />
            </button>
          ) : (
            <div className='task__content-buttons'>
              <button
                className='task__content-start'
                onClick={() => onToggleTaskActivity(task.id)}
              >
                {task.isActive ? <FaPause /> : <FaPlay />}
              </button>
              <button
                className='task__content-edit'
                onClick={() => onEditTaskName(task.id)}
              >
                <FaEdit />
              </button>

              <button
                className='task__content-delete'
                onClick={() => onDeleteTask(task.id)}
              >
                <FaTrashAlt />
              </button>

              <button
                className='task-content_tag-editor'
                onClick={handleTagEditorOpen}
              >
                <FaPlus />
              </button>
            </div>
          )}
        </div>

        <div className='task__tags'>
          {(task.tags || []).map((tag) => (
            <span key={tag} className='tag'>
              <>
                {tag}
                <button
                  className='tag__delete-button'
                  onClick={() => onDeleteTag(task.id, tag)}
                >
                  {' '}
                  <FaTrashAlt />
                </button>
              </>
            </span>
          ))}
        </div>
      </div>
      {tasksWithWarnings.has(task.id) && (
        <p className='tag-warning'>A task must have at least one tag!</p>
      )}
      <div className='tag-editor'>
        {isTagEditorOpen && (
          <TagEditor
            className='tag-edit'
            task={task}
            tags={tags}
            setTasks={setTasks}
            setTags={setTags}
            onAddTag={onAddTag}
            onClose={handleTagEditorClose}
          />
        )}
      </div>
    </div>
  );
};

export default Task;
