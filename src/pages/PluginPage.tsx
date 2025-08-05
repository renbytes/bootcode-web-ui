// src/pages/PluginPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Github, User, Clock, Code } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Define the type for a plugin's data structure
interface Plugin {
  id: string;
  name: string;
  description: string;
  language: string;
  version: string;
  githubUrl: string;
  author: {
    id: string;
    username: string;
    avatarUrl: string;
  };
  createdAt: string;
}

const GITHUB_URL_REGEX = /https:\/\/github\.com\/([^\/]+)\/([^\/]+)/;

const PluginPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [plugin, setPlugin] = useState<Plugin | null>(null);
  const [readmeContent, setReadmeContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPluginData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      // 1. Fetch plugin metadata from Supabase
      const { data, error: dbError } = await supabase
        .from('plugins')
        .select(`*, profiles (username, avatar_url)`)
        .eq('id', id)
        .single();

      if (dbError) {
        setError(dbError.message);
        setLoading(false);
        return;
      }
      
      const formattedPlugin: Plugin = {
        id: data.id,
        name: data.name,
        description: data.description,
        language: data.language,
        version: data.version,
        githubUrl: data.github_url,
        createdAt: new Date(data.created_at).toLocaleDateString(),
        author: {
          id: data.user_id,
          username: data.profiles?.username || 'Unknown',
          avatarUrl: data.profiles?.avatar_url || '',
        },
      };
      setPlugin(formattedPlugin);

      // 2. Fetch README.md from the plugin's GitHub repo
      const match = formattedPlugin.githubUrl.match(GITHUB_URL_REGEX);
      if (match) {
        const [, owner, repo] = match;
        const readmeUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`;
        try {
          const readmeResponse = await fetch(readmeUrl);
          if (readmeResponse.ok) {
            const readmeText = await readmeResponse.text();
            setReadmeContent(readmeText);
          } else {
            setReadmeContent('Could not load README.md from the repository.');
          }
        } catch (fetchError) {
          setReadmeContent('Failed to fetch README.md.');
        }
      }
      setLoading(false);
    };

    fetchPluginData();
  }, [id]);

  if (loading) {
    return <div className="text-center p-10">Loading plugin details...</div>;
  }

  if (error || !plugin) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold text-primary mb-4">Plugin Not Found</h1>
        <p className="text-dark-gray">The plugin you are looking for does not exist. Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="bg-white p-6 rounded-lg shadow-md border border-medium-gray">
        {/* Plugin Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center">
              <Code className="mr-3 text-accent"/> {plugin.name}
            </h1>
            <div className="flex items-center text-dark-gray mt-3 text-sm space-x-4">
              <div className="flex items-center">
                <User size={14} className="mr-1.5"/>
                <img src={plugin.author.avatarUrl} alt={plugin.author.username} className="w-5 h-5 rounded-full mr-2" />
                <span>{plugin.author.username}</span>
              </div>
              <div className="flex items-center">
                <Clock size={14} className="mr-1.5"/>
                <span>Version {plugin.version}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a href={plugin.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition-colors">
              <Github size={16} className="mr-2"/> View on GitHub
            </a>
          </div>
        </div>
        <p className="text-dark-gray mb-6">{plugin.description}</p>
        <div className="border-t border-medium-gray my-6"></div>
        
        {/* Rendered README Content */}
        <article className="prose lg:prose-xl max-w-none">
            <ReactMarkdown>{readmeContent}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
};

export default PluginPage;
