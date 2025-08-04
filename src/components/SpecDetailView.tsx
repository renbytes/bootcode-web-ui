import React from 'react';

interface User {
  id: string;
  username: string;
  avatar_url: string;
}

interface SpecDetail {
  id: string;
  title: string;
  description: string;
  language: string;
  tags: string[];
  author: User;
  content: string;
}

interface SpecDetailViewProps {
  spec: SpecDetail;
}

const SpecDetailView: React.FC<SpecDetailViewProps> = ({ spec }) => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{spec.title}</h1>
      <p>{spec.description}</p>
      <pre className="bg-gray-100 p-4 rounded">{spec.content}</pre>
    </div>
  );
};

export default SpecDetailView;