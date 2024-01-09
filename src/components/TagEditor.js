import React, { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';
import { IoClose } from 'react-icons/io5';

// TagEditor component that allows editing of tags related to a task
const TagEditor = ({ task, tags, onAddTag, setTags, onClose }) => {
  // const URL = 'http://localhost:3010';
  const URL = 'https://task-manager-appl-5871d2ece47c.herokuapp.com/api';
  const [selectedTag, setSelectedTag] = useState(null);
  const [newTag, setNewTag] = useState('');
  const [tagOptions, setTagOptions] = useState([]);
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  // Effect to update the tag options when the tags prop changes
  useEffect(() => {
    setTagOptions(
      (tags || []).map((tag) => ({ value: tag.name, label: tag.name }))
    );
  }, [tags]);

  // Function to handle selection of a tag from the dropdown menu
  const handleTagChange = (selectedOption) => {
    setSelectedTag(selectedOption);
  };

  // Create of a new tag
  const handleCreateTag = (inputValue) => {
    const newTagName = inputValue.trim();
    if (newTagName === '') return;
    const tagExists = tags.some((tag) => tag.name === newTagName);
    if (tagExists) return;

    //POST request to add the new tag
    fetch(`${URL}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTagName }),
    })
      .then((response) => response.json())
      .then((data) => {
        setTags((prevTags) => [...prevTags, data]);
        onAddTag(task.id, newTagName);
        setNewTag('');
        setMenuIsOpen(false);
      })
      .catch((error) => console.error('Error adding new tag:', error));
  };

  // Handler for change in the new tag input field
  const handleNewTagChange = (inputValue) => {
    setNewTag(inputValue);
  };

  // Handles adding the new or selected tag to the task
  const handleAddNewTag = () => {
    if (selectedTag) {
      onAddTag(task.id, selectedTag.value);
      setSelectedTag(null);
      setMenuIsOpen(false);
    } else if (newTag.trim()) {
      handleCreateTag(newTag);
    }
  };

  return (
    <div className='tag-editor'>
      <button className='tag-editor__close' onClick={onClose}>
        <IoClose />
      </button>
      <CreatableSelect
        name='tags'
        options={tagOptions}
        value={selectedTag}
        onChange={handleTagChange}
        onCreateOption={handleCreateTag}
        className='tag-editor__select__control'
        classNamePrefix='select'
        placeholder='Select a tag...'
        menuIsOpen={menuIsOpen}
        onMenuClose={() => setMenuIsOpen(false)}
        onMenuOpen={() => setMenuIsOpen(true)}
      />
      <div>
        <input
          className='tag-editor__input'
          type='text'
          placeholder='Enter new tag'
          value={newTag}
          onChange={(e) => handleNewTagChange(e.target.value)}
        />
      </div>
      <button className='tag-editor__add' onClick={handleAddNewTag}>
        Add Tag
      </button>
    </div>
  );
};

export default TagEditor;
