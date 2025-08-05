// src/pages/BrowsePage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Spec } from '../types'; // We'll reuse the Spec type for cards for simplicity
import SpecCard from '../components/SpecCard';
import { Search, FileText, Plug } from 'lucide-react';

const BrowsePage: React.FC = () => {
  const [items, setItems] = useState<Spec[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Get the 'type' query parameter from the URL (e.g., ?type=specs)
  const queryParams = new URLSearchParams(location.search);
  const typeFilter = queryParams.get('type');

  useEffect(() => {
    const fetchAllItems = async () => {
      setLoading(true);
      setError(null);

      // Fetch specs and plugins in parallel
      const [specsResponse, pluginsResponse] = await Promise.all([
        supabase.from('specs').select(`*, profiles (username, avatar_url)`),
        supabase.from('plugins').select(`*, profiles (username, avatar_url)`)
      ]);
      
      let allItems: Spec[] = [];

      if (specsResponse.error) {
        console.error("Error fetching specs:", specsResponse.error);
        setError(specsResponse.error.message);
      } else {
        const formattedSpecs = specsResponse.data.map((spec: any) => ({
          id: spec.id,
          name: spec.name,
          description: spec.description,
          tags: spec.tags || ['spec'], // Add a default tag
          rating: spec.rating || 0,
          totalRatings: spec.total_ratings || 0,
          author: {
            id: spec.user_id,
            username: spec.profiles?.username || 'Unknown',
            avatarUrl: spec.profiles?.avatar_url || '',
          },
          // Dummy data for fields not in card view
          longDescription: '', language: '', version: '', lastUpdated: '', githubUrl: '', tomlContent: '', versionHistory: [],
        }));
        allItems = [...allItems, ...formattedSpecs];
      }

      if (pluginsResponse.error) {
        console.error("Error fetching plugins:", pluginsResponse.error);
        setError(pluginsResponse.error.message);
      } else {
        const formattedPlugins = pluginsResponse.data.map((plugin: any) => ({
          id: plugin.id,
          name: plugin.name,
          description: plugin.description,
          tags: [plugin.language, 'plugin'], // Add default tags
          rating: 0, // Plugins don't have ratings yet
          totalRatings: 0,
          author: {
            id: plugin.user_id,
            username: plugin.profiles?.username || 'Unknown',
            avatarUrl: plugin.profiles?.avatar_url || '',
          },
          // Dummy data
          longDescription: '', language: '', version: '', lastUpdated: '', githubUrl: '', tomlContent: '', versionHistory: [],
        }));
        allItems = [...allItems, ...formattedPlugins];
      }

      setItems(allItems);
      setLoading(false);
    };

    fetchAllItems();
  }, []);

  const handleCardClick = (id: string, type: 'spec' | 'plugin') => {
    navigate(`/${type}/${id}`);
  };

  // Filter by search term first, then by type from URL
  const filteredItems = items
    .filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(item => {
      if (!typeFilter) return true; // If no type filter, show all
      return item.tags.includes(typeFilter.slice(0, -1)); // Match 'spec' or 'plugin' from 'specs' or 'plugins'
    });

  if (loading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-primary text-center mb-8">Browse the Hub</h1>
      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, description, or tag (e.g., 'pyspark', 'plugin')..."
            className="w-full p-4 pr-12 text-lg text-primary rounded-md border-2 border-medium-gray focus:outline-none focus:border-accent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            const isPlugin = item.tags.includes('plugin');
            // We can reuse SpecCard, but ideally you'd have a generic Card component
            return <SpecCard key={item.id} spec={item} onClick={() => handleCardClick(item.id, isPlugin ? 'plugin' : 'spec')} />;
          })
        ) : (
          <p className="col-span-full text-center text-dark-gray">No items found matching your criteria.</p>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;
