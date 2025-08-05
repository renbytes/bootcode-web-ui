// src/pages/SubmitSpecPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Github } from 'lucide-react';

const SubmitSpecPage: React.FC = () => {
  const [githubUrl, setGithubUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        setError("You must be logged in to submit a spec.");
        setLoading(false);
        return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('submit-spec-from-github', {
        body: { githubUrl },
      });

      if (error) throw error;
      
      const newSpecId = data.data.id;
      setSuccess('Spec submitted successfully! Redirecting...');
      setTimeout(() => navigate(`/spec/${newSpecId}`), 2000);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16">
      <div className="bg-white p-8 rounded-lg shadow-md border border-medium-gray">
        <div className="text-center mb-8">
            <Github size={48} className="mx-auto text-primary mb-4" />
            <h1 className="text-3xl font-bold text-primary">Submit a New Spec</h1>
            <p className="text-dark-gray mt-2">
                Provide a link to a public GitHub repository containing a `spec.toml` file.
            </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="githubUrl" className="block text-primary font-bold mb-2">
              GitHub Repository URL
            </label>
            <input
              type="url"
              id="githubUrl"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full p-3 text-lg text-primary rounded-md border-2 border-medium-gray focus:outline-none focus:border-accent"
              placeholder="https://github.com/user/repo-name"
              required
            />
          </div>

          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
          {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{success}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-red-700 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Submitting...' : 'Submit Spec'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitSpecPage;
