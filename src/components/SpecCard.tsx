import React from 'react';
import { Spec } from '../types';
import { Star, Code } from 'lucide-react';

interface SpecCardProps {
  spec: Spec;
  onClick: (id: string) => void;
}

const SpecCard: React.FC<SpecCardProps> = ({ spec, onClick }) => {
  return (
    <div 
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer border border-medium-gray"
      onClick={() => onClick(spec.id)}
    >
      <div className="flex items-center mb-2">
        <Code className="mr-2 text-dark-gray" />
        <h3 className="font-bold text-xl text-primary">{spec.name}</h3>
      </div>
      <p className="text-dark-gray mb-4 h-12 overflow-hidden">{spec.description}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {spec.tags.slice(0, 3).map(tag => (
          <span key={tag} className="bg-gray-200 text-dark-gray text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {tag}
          </span>
        ))}
      </div>
      <div className="flex justify-between items-center text-sm text-dark-gray border-t border-medium-gray pt-4">
        <div className="flex items-center">
            <img src={spec.author.avatarUrl} alt={spec.author.username} className="w-6 h-6 rounded-full mr-2" />
            <span>{spec.author.username}</span>
        </div>
        <div className="flex items-center">
          <Star size={16} className="text-yellow-500 mr-1" />
          <span>{spec.rating.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};

export default SpecCard;
