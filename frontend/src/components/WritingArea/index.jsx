import React, { useState, useEffect } from 'react';
import './styles.css';


const WritingArea = (props) => {
  const { content, setContent } = props;

  return (
    <textarea
      className="writing-area px-2"
      value={content}
      onChange={(evt) => setContent(evt.target.value)}
    />
  );
};

export default WritingArea;
