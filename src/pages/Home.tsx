import React from 'react';
import { useNavigate } from 'react-router-dom';
import SpecCard from '../components/SpecCard';
import { mockSpecs } from '../data';
import { Search, Package } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleSpecClick = (id: string) => {
    navigate(`/spec/${id}`);
  };

  return (
    <main>
      {/* Hero Section with Search */}
      <section className="bg-primary text-white py-20 px-4">
        <div className="container mx-auto text-center">
          <Package size={64} className="mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find & Share Code Specs</h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            The central registry for high-quality, reusable code specifications and plugins.
          </p>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for specs (e.g., 'pyspark', 'ecommerce')..."
                className="w-full p-4 pr-12 text-lg text-primary rounded-md border-2 border-transparent focus:outline-none focus:border-accent"
              />
              <Search className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Top Ranked Specs Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">Top Ranked Specs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockSpecs.map((spec) => (
            <SpecCard key={spec.id} spec={spec} onClick={handleSpecClick} />
          ))}
        </div>
      </section>
    </main>
  );
};

export default Home;
