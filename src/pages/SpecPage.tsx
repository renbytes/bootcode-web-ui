import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Spec } from '../types';
import SpecDetailView from '../components/SpecDetailView';
import { Star, Github, Code, Clock, User } from 'lucide-react';

const SpecPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [spec, setSpec] = useState<Spec | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpec = async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('specs')
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
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
            versionHistory: [] // Can be implemented later
        };
        setSpec(formattedSpec);
      }
      setLoading(false);
    };

    fetchSpec();
  }, [id]);

  if (loading) {
    return <div className="text-center p-10">Loading spec details...</div>;
  }

  if (error || !spec) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold text-primary mb-4">Spec Not Found</h1>
        <p className="text-dark-gray">The specification you are looking for does not exist. Error: {error}</p>
      </div>
    );
  }

  const specDetailForView = {
    id: spec.id,
    title: spec.name,
    description: spec.longDescription,
    language: spec.language,
    tags: spec.tags,
    author: {
        id: spec.author.id,
        username: spec.author.username,
        avatar_url: spec.author.avatarUrl,
    },
    content: spec.tomlContent,
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="bg-white p-6 rounded-lg shadow-md border border-medium-gray">
        <div className="flex flex-col md:flex-row justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center">
                <Code className="mr-3 text-accent"/> {spec.name}
            </h1>
            <div className="flex items-center text-dark-gray mt-3 text-sm space-x-4">
              <div className="flex items-center">
                <User size={14} className="mr-1.5"/>
                <img src={spec.author.avatarUrl} alt={spec.author.username} className="w-5 h-5 rounded-full mr-2" />
                <span>{spec.author.username}</span>
              </div>
              <div className="flex items-center">
                <Clock size={14} className="mr-1.5"/>
                <span>Updated {spec.lastUpdated}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a href={spec.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition-colors">
                <Github size={16} className="mr-2"/> View on GitHub
            </a>
            <div className="flex items-center bg-light-gray px-3 py-2 rounded-md border border-medium-gray">
              <Star size={20} className="text-yellow-500 mr-2" />
              <span className="font-bold text-lg">{spec.rating.toFixed(1)}</span>
              <span className="text-sm text-dark-gray ml-1">({spec.totalRatings})</span>
            </div>
          </div>
        </div>

        <div className="border-t border-medium-gray my-6"></div>

        <p className="text-dark-gray mb-6">{spec.longDescription}</p>

        <div className="flex flex-wrap gap-2 mb-6">
          {spec.tags.map(tag => (
            <span key={tag} className="bg-gray-200 text-dark-gray text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        <SpecDetailView spec={specDetailForView} />
      </div>
    </div>
  );
};

export default SpecPage;
