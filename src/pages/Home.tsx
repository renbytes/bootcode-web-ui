// src/pages/Home.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Spec } from '../types';
import FeaturedCard from '../components/FeaturedCard'; // Import the new unified card
import { Package, Copy, Check } from 'lucide-react';

const Home: React.FC = () => {
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [plugins, setPlugins] = useState<any[]>([]); // Using 'any' for simplicity
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const command = 'pip install boot-code';
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

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      // Fetch top specs and plugins in parallel
      const [specsResponse, pluginsResponse] = await Promise.all([
        supabase
          .from('specs')
          .select(`*, profiles(username, avatar_url)`)
          .order('rating', { ascending: false })
          .limit(3),
        supabase
          .from('plugins')
          .select(`*, profiles(username, avatar_url)`)
          .order('created_at', { ascending: false })
          .limit(3),
      ]);

      if (specsResponse.data) {
        const formattedSpecs = specsResponse.data.map((spec: any) => ({
          id: spec.id,
          name: spec.name,
          description: spec.description,
          tags: spec.tags || [],
          rating: spec.rating,
          totalRatings: spec.total_ratings,
          author: {
            id: spec.user_id,
            username: spec.profiles?.username || 'Unknown',
            avatarUrl: spec.profiles?.avatar_url || '',
          },
          // Dummy data for type compatibility
          longDescription: '',
          language: '',
          version: '',
          lastUpdated: '',
          githubUrl: '',
          tomlContent: '',
          versionHistory: [],
        }));
        setSpecs(formattedSpecs);
      }

      if (pluginsResponse.data) {
        const formattedPlugins = pluginsResponse.data.map((plugin: any) => ({
            id: plugin.id,
            name: plugin.name,
            description: plugin.description,
            author: {
                id: plugin.user_id,
                username: plugin.profiles?.username || 'Unknown',
                avatarUrl: plugin.profiles?.avatar_url || '',
            }
        }));
        setPlugins(formattedPlugins);
      }
    };
    fetchFeaturedItems();
  }, []);

  return (
    <main>
      {/* Hero Section */}
      <section className="bg-primary text-white py-20 px-4">
        <div className="container mx-auto text-center">
          <Package size={64} className="mx-auto mb-4 text-accent" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Build-Passing Code, Instantly
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Generate complete, production-ready code from simple specifications
            with the Boot AI engine.
          </p>
          <div className="max-w-md mx-auto bg-secondary rounded-lg p-4 flex items-center justify-between font-mono text-left shadow-lg">
            <span className="text-gray-300">$</span>
            <span className="text-white mx-4 flex-grow">
              pip install boot-code
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
      </section>

      {/* Featured Content Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Featured Specs Column */}
          <div>
            <h2 className="text-3xl font-bold text-center mb-10">
              Featured Specs
            </h2>
            {specs.length > 0 ? (
              <div className="grid grid-cols-1 gap-8">
                {specs.map((spec) => (
                  <FeaturedCard key={spec.id} item={spec} type="spec" />
                ))}
              </div>
            ) : (
              <p className="text-center text-dark-gray">
                No featured specs available yet.
              </p>
            )}
          </div>

          {/* Featured Plugins Column */}
          <div>
            <h2 className="text-3xl font-bold text-center mb-10">
              Featured Plugins
            </h2>
            {plugins.length > 0 ? (
              <div className="grid grid-cols-1 gap-8">
                {plugins.map((plugin) => (
                  <FeaturedCard key={plugin.id} item={plugin} type="plugin" />
                ))}
              </div>
            ) : (
              <p className="text-center text-dark-gray">
                No featured plugins available yet.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
