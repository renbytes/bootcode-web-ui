// src/pages/BrowsePage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Spec } from '../types';
import SpecCard from '../components/SpecCard';
import { Search } from 'lucide-react';

const BrowsePage: React.FC = () => {
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSpecs = async () => {
      setLoading(true);
      // Query specs and join with profiles to get author info
      const { data, error } = await supabase
        .from('specs')
        .select(`
          id,
          name,
          description,
          tags,
          rating,
          total_ratings,
          profiles (
            username,
            avatar_url
          )
        `);

      if (error) {
        setError(error.message);
        console.error("Error fetching specs:", error);
      } else {
        // Map the data to the Spec type structure
        const formattedSpecs = data.map((spec: any) => ({
          id: spec.id,
          name: spec.name,
          description: spec.description,
          tags: spec.tags || [],
          rating: spec.rating,
          totalRatings: spec.total_ratings,
          author: {
            id: '', // Not needed for card
            username: spec.profiles.username,
            avatarUrl: spec.profiles.avatar_url,
          },
          // Add dummy data for fields not in the card view
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
      setLoading(false);
    };

    fetchSpecs();
  }, []);

  const handleSpecClick = (id: string) => {
    navigate(`/spec/${id}`);
  };

  const filteredSpecs = specs.filter(spec =>
    spec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spec.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spec.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <div className="text-center p-10">Loading specs...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-primary text-center mb-8">Browse All Specs</h1>
      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <input
            type="text"
            placeholder="Search specs by name, description, or tag..."
            className="w-full p-4 pr-12 text-lg text-primary rounded-md border-2 border-medium-gray focus:outline-none focus:border-accent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredSpecs.length > 0 ? (
          filteredSpecs.map((spec) => (
            <SpecCard key={spec.id} spec={spec} onClick={handleSpecClick} />
          ))
        ) : (
          <p className="col-span-full text-center text-dark-gray">No specs found matching your search.</p>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;
