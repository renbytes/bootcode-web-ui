import React from 'react';
import { useParams } from 'react-router-dom';
import { mockSpecs } from '../data';
import SpecDetailView from '../components/SpecDetailView';
import { Star } from 'lucide-react';

const SpecPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const spec = mockSpecs.find((s) => s.id === id);

  if (!spec) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold text-primary mb-4">Spec Not Found</h1>
        <p className="text-dark-gray">The specification you are looking for does not exist.</p>
      </div>
    );
  }

  // The SpecDetailView component expects a slightly different data shape for its props.
  // We map our `Spec` object to the `SpecDetail` shape expected by the component.
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
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary">{spec.name}</h1>
                    <div className="flex items-center text-dark-gray mt-2">
                        <img src={spec.author.avatarUrl} alt={spec.author.username} className="w-6 h-6 rounded-full mr-2" />
                        <span>{spec.author.username}</span>
                        <span className="mx-2">·</span>
                        <span>Version {spec.version}</span>
                        <span className="mx-2">·</span>
                        <span>Last updated {spec.lastUpdated}</span>
                    </div>
                </div>
                <div className="flex items-center bg-light-gray px-3 py-1 rounded-md">
                    <Star size={20} className="text-yellow-500 mr-2" />
                    <span className="font-bold text-lg">{spec.rating.toFixed(1)}</span>
                    <span className="text-sm text-dark-gray ml-1">({spec.totalRatings})</span>
                </div>
            </div>

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