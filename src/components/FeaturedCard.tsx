// src/components/FeaturedCard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Copy, Check, FileText, Plug } from 'lucide-react';

interface CardItem {
  id: string;
  name: string;
  description: string;
  rating?: number;
  author: {
    username: string;
    avatarUrl: string;
  };
}

interface FeaturedCardProps {
  item: CardItem;
  type: 'spec' | 'plugin';
}

const FeaturedCard: React.FC<FeaturedCardProps> = ({ item, type }) => {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/${type}/${item.id}`);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking the copy button
    const command =
      type === 'spec'
        ? `boot generate hub:${item.id}`
        : `boot plugin install ${item.name}`;

    const textArea = document.createElement('textarea');
    textArea.value = command;
    textArea.style.position = 'absolute';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    } finally {
      document.body.removeChild(textArea);
    }
  };

  const MainIcon = type === 'spec' ? FileText : Plug;

  return (
    <div
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow border border-medium-gray flex flex-col h-full cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex-grow">
        <div className="flex items-center mb-2">
          <MainIcon className="mr-2 text-dark-gray" />
          <h3 className="font-bold text-xl text-primary">{item.name}</h3>
        </div>
        <p className="text-dark-gray mb-4 h-12 overflow-hidden">{item.description}</p>
        <div className="flex justify-between items-center text-sm text-dark-gray border-t border-medium-gray pt-4 mb-4">
          <div className="flex items-center">
            <img
              src={item.author.avatarUrl}
              alt={item.author.username}
              className="w-6 h-6 rounded-full mr-2"
            />
            <span>{item.author.username}</span>
          </div>
          {type === 'spec' && item.rating !== undefined && (
            <div className="flex items-center">
              <Star size={16} className="text-yellow-500 mr-1" />
              <span>{item.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
      {/* "Use Now" Command Block */}
      <div className="mt-auto">
        <div className="bg-secondary rounded-lg px-2 h-10 flex items-center justify-between font-mono text-left shadow-inner">
          <span className="text-gray-400">$</span>
          <span className="text-white mx-2 flex-grow truncate text-sm">
            {type === 'spec'
              ? `boot generate hub:${item.id.slice(0, 8)}...`
              : `boot plugin install ${item.name}`}
          </span>
          <button
            onClick={handleCopy}
            className="text-gray-400 hover:text-white transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <Check size={18} className="text-green-400" />
            ) : (
              <Copy size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCard;
