import React from 'react';

interface CommentData {
  id: string;
  text: string;
  author: {
    username: string;
    avatar_url: string;
  };
}

interface CommentProps {
  comment: CommentData;
}

const Comment: React.FC<CommentProps> = ({ comment }) => {
  return (
    <div className="flex items-start mb-4">
      <img src={comment.author.avatar_url} alt={comment.author.username} className="w-8 h-8 rounded-full mr-2" />
      <div>
        <p className="font-bold">{comment.author.username}</p>
        <p>{comment.text}</p>
      </div>
    </div>
  );
};

export default Comment;