// src/components/DetailPage.tsx
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Star,
  Github,
  Code,
  Clock,
  User,
  Copy,
  Check,
  FileText,
  Plug,
} from 'lucide-react';

/**
 * @interface DetailPageProps
 * @description Defines the props for the unified DetailPage component.
 * It accepts a generic data structure that can represent either a Spec or a Plugin.
 */
interface DetailPageProps {
  type: 'spec' | 'plugin';
  item: {
    id: string;
    name: string;
    description: string;
    longDescription?: string;
    version: string;
    githubUrl: string;
    author: {
      username: string;
      avatarUrl: string;
    };
    lastUpdated: string;
    // Spec-only properties
    rating?: number;
    totalRatings?: number;
    tags?: string[];
    // Content can be TOML for specs or Markdown for plugins
    content: string;
  };
}

/**
 * @function DetailPage
 * @description A reusable component to display the detailed view for either a Spec or a Plugin.
 * It dynamically adjusts its rendering based on the `type` prop.
 *
 * @example
 * <DetailPage type="spec" item={specData} />
 * <DetailPage type="plugin" item={pluginData} />
 */
const DetailPage: React.FC<DetailPageProps> = ({ type, item }) => {
  const [copied, setCopied] = useState(false);

  /**
   * @function handleCopy
   * @description Copies the appropriate CLI command to the clipboard based on the item type.
   */
  const handleCopy = () => {
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
    <div className="container mx-auto p-4 md:p-8">
      <div className="bg-white p-6 rounded-lg shadow-md border border-medium-gray">
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-4">
          {/* Left side: Title and metadata */}
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center">
              <MainIcon className="mr-3 text-accent" /> {item.name}
            </h1>
            <div className="flex items-center text-dark-gray mt-3 text-sm space-x-4">
              <div className="flex items-center">
                <User size={14} className="mr-1.5" />
                <img
                  src={item.author.avatarUrl}
                  alt={item.author.username}
                  className="w-5 h-5 rounded-full mr-2"
                />
                <span>{item.author.username}</span>
              </div>
              <div className="flex items-center">
                <Clock size={14} className="mr-1.5" />
                <span>
                  {type === 'spec'
                    ? `Updated ${item.lastUpdated}`
                    : `Version ${item.version}`}
                </span>
              </div>
            </div>
          </div>

          {/* Right side: Actions and ratings */}
          <div className="flex flex-col items-end space-y-3 mt-4 md:mt-0">
            <div className="flex items-center space-x-4">
              <a
                href={item.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center bg-primary text-white px-4 h-10 rounded-md hover:bg-secondary transition-colors"
              >
                <Github size={16} className="mr-2" /> View on GitHub
              </a>
              {/* Conditional rendering for the rating block */}
              {type === 'spec' && item.rating !== undefined && (
                <div className="flex items-center bg-light-gray px-3 h-10 rounded-md border border-medium-gray">
                  <Star size={20} className="text-yellow-500 mr-2" />
                  <span className="font-bold text-lg">
                    {item.rating.toFixed(1)}
                  </span>
                  <span className="text-sm text-dark-gray ml-1">
                    ({item.totalRatings})
                  </span>
                </div>
              )}
            </div>

            {/* "Use Now" Command Block */}
            <div className="w-96">
              <label className="block text-xs font-semibold text-dark-gray text-right mb-1">
                USE NOW
              </label>
              <div className="bg-secondary rounded-lg px-2 h-10 flex items-center justify-between font-mono text-left shadow-lg">
                <span className="text-gray-400">$</span>
                <span className="text-white mx-2 flex-grow truncate">
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
                    <Check size={20} className="text-green-400" />
                  ) : (
                    <Copy size={20} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-medium-gray my-6"></div>

        {/* --- Details Section --- */}
        <p className="text-dark-gray mb-6">
          {item.longDescription || item.description}
        </p>

        {/* Conditional rendering for tags */}
        {type === 'spec' && item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="bg-gray-200 text-dark-gray text-xs font-semibold px-2.5 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* --- Content Section (TOML or Markdown) --- */}
        {type === 'spec' ? (
          <pre className="bg-gray-100 p-4 rounded-md text-sm whitespace-pre-wrap">
            <code>{item.content}</code>
          </pre>
        ) : (
          <article className="prose lg:prose-xl max-w-none">
            <ReactMarkdown>{item.content}</ReactMarkdown>
          </article>
        )}
      </div>
    </div>
  );
};

export default DetailPage;
