// src/pages/SpecPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Spec } from '../types';
import DetailPage from 'components/DetailPage'; // Corrected import path
import { Star, Github, Code, Clock, User, Copy, Check } from 'lucide-react';

const SpecPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [spec, setSpec] = useState<Spec | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSpec = async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('specs')
        .select(`*, profiles (username, avatar_url)`)
        .eq('id', id)
        .single();

      if (error) {
        setError(error.message);
        console.error("Error fetching spec:", error);
      } else {
        const formattedSpec: Spec = {
          id: data.id,
          name: data.name,
          description: data.description,
          longDescription: data.long_description || data.description,
          language: data.language,
          tags: data.tags || [],
          rating: data.rating,
          totalRatings: data.total_ratings,
          version: data.version || '1.0.0',
          lastUpdated: new Date(data.created_at).toLocaleDateString(),
          githubUrl: data.github_url,
          tomlContent: data.toml_content,
          author: {
            id: data.user_id,
            username: data.profiles.username,
            avatarUrl: data.profiles.avatar_url,
          },
          versionHistory: [], // Can be implemented later
        };
        setSpec(formattedSpec);
      }
      setLoading(false);
    };

    fetchSpec();
  }, [id]);

  const handleCopy = () => {
    if (!spec) return;
    const command = `boot generate hub:${spec.id}`;
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

  if (loading) {
    return <div className="text-center p-10">Loading spec details...</div>;
  }

  if (error || !spec) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold text-primary mb-4">Spec Not Found</h1>
        <p className="text-dark-gray">
          The specification you are looking for does not exist. Error: {error}
        </p>
      </div>
    );
  }

  const detailPageItem = {
    id: spec.id,
    name: spec.name,
    description: spec.description,
    longDescription: spec.longDescription,
    version: spec.version,
    githubUrl: spec.githubUrl,
    author: spec.author,
    lastUpdated: spec.lastUpdated,
    rating: spec.rating,
    totalRatings: spec.totalRatings,
    tags: spec.tags,
    content: spec.tomlContent,
  };

  return <DetailPage type="spec" item={detailPageItem} />;
};

export default SpecPage;
