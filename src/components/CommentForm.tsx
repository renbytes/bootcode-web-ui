import React, { useState } from 'react';

interface CommentFormProps {
  onSubmit: (text: string) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ onSubmit }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(text);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="border p-2 rounded mb-2"
        placeholder="Write a comment..."
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">Submit</button>
    </form>
  );
};

export default CommentForm;