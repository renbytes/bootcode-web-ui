import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Assuming you might fetch top specs later
import { Spec } from '../types';
import SpecCard from '../components/SpecCard';
import { Package, Copy, Check } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [specs, setSpecs] = useState<Spec[]>([]); // Ready for when you fetch real data
  const [copied, setCopied] = useState(false);

  /**
   * Handles copying text to the clipboard using a robust method that works
   * across different browser environments, including iframes.
   */
  const handleCopy = () => {
    const command = 'pip install boot-code';
    
    // Create a temporary textarea element to hold the text
    const textArea = document.createElement('textarea');
    textArea.value = command;
    
    // Style the textarea to be invisible
    textArea.style.position = 'absolute';
    textArea.style.left = '-9999px';
    
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      // Use the deprecated but highly compatible execCommand
      document.execCommand('copy');
      setCopied(true);
      // Reset the checkmark icon after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    } finally {
      // Clean up the temporary element
      document.body.removeChild(textArea);
    }
  };

  const handleSpecClick = (id: string) => {
    navigate(`/spec/${id}`);
  };

  // You can replace this useEffect with a real data fetch from Supabase
  useEffect(() => {
    // Example of how you might fetch top-rated specs in the future
    const fetchTopSpecs = async () => {
        const { data, error } = await supabase
            .from('specs')
            .select(`*, profiles(username, avatar_url)`)
            .order('rating', { ascending: false })
            .limit(3);

        if (data) {
            const formattedSpecs = data.map((spec: any) => ({
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
              longDescription: '', language: '', version: '', lastUpdated: '', githubUrl: '', tomlContent: '', versionHistory: [],
            }));
            setSpecs(formattedSpecs);
        }
    };
    fetchTopSpecs();
  }, []);

  return (
    <main>
      {/* Hero Section with Installation Command */}
      <section className="bg-primary text-white py-20 px-4">
        <div className="container mx-auto text-center">
          <Package size={64} className="mx-auto mb-4 text-accent" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Build-Passing Code, Instantly</h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Generate complete, production-ready code from simple specifications with the Boot AI engine.
          </p>
          
          {/* Installation Command Block */}
          <div className="max-w-md mx-auto bg-secondary rounded-lg p-4 flex items-center justify-between font-mono text-left shadow-lg">
            <span className="text-gray-300">$</span>
            <span className="text-white mx-4 flex-grow">pip install boot-code</span>
            <button onClick={handleCopy} className="text-gray-400 hover:text-white transition-colors" title="Copy to clipboard">
              {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
            </button>
          </div>
        </div>
      </section>

      {/* Top Ranked Specs Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">Featured Specs</h2>
        {specs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {specs.map((spec) => (
                <SpecCard key={spec.id} spec={spec} onClick={handleSpecClick} />
            ))}
            </div>
        ) : (
            <p className="text-center text-dark-gray">No featured specs available yet. Be the first to submit one!</p>
        )}
      </section>
    </main>
  );
};

export default Home;
