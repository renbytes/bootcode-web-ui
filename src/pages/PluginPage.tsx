// src/pages/PluginPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import DetailPage from 'components/DetailPage'; // Import the new component

const GITHUB_URL_REGEX = /https:\/\/github\.com\/([^\/]+)\/([^\/]+)/;

const PluginPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [pluginData, setPluginData] = useState<any | null>(null);
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
      setPluginData(data);

      // 2. Fetch README.md from the plugin's GitHub repo
      const match = data.github_url.match(GITHUB_URL_REGEX);
      if (match) {
        const [, owner, repo] = match;
        const readmeUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`;
        try {
          const readmeResponse = await fetch(readmeUrl);
          if (readmeResponse.ok) {
            setReadmeContent(await readmeResponse.text());
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

  if (error || !pluginData) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold text-primary mb-4">Plugin Not Found</h1>
        <p className="text-dark-gray">
          The plugin you are looking for does not exist. Error: {error}
        </p>
      </div>
    );
  }

  // Map the plugin data to the props expected by DetailPage
  const detailPageItem = {
    id: pluginData.id,
    name: pluginData.name,
    description: pluginData.description,
    version: pluginData.version,
    githubUrl: pluginData.github_url,
    author: {
      username: pluginData.profiles?.username || 'Unknown',
      avatarUrl: pluginData.profiles?.avatar_url || '',
    },
    lastUpdated: new Date(pluginData.created_at).toLocaleDateString(),
    content: readmeContent,
  };

  return <DetailPage type="plugin" item={detailPageItem} />;
};

export default PluginPage;
