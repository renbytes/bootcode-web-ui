// src/pages/SubmitPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Github, FileText, Plug } from 'lucide-react';

type SubmissionType = 'spec' | 'plugin';

const SubmitPage: React.FC = () => {
  const [submissionType, setSubmissionType] = useState<SubmissionType>('spec');
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
      setError("You must be logged in to submit.");
      setLoading(false);
      return;
    }

    const functionName = submissionType === 'spec' 
      ? 'submit-spec-from-github' 
      : 'submit-plugin-from-github';

    try {
      const { data, error: invokeError } = await supabase.functions.invoke(functionName, {
        body: { githubUrl },
      });

      if (invokeError) throw invokeError;
      
      const newId = data.data.id;
      setSuccess('Submission successful! Redirecting...');
      // Navigate to the correct page based on type
      setTimeout(() => navigate(submissionType === 'spec' ? `/spec/${newId}` : `/plugin/${newId}`), 2000);

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
          <h1 className="text-3xl font-bold text-primary">Submit to the Hub</h1>
          <p className="text-dark-gray mt-2">Share your spec or plugin with the community.</p>
        </div>

        {/* Submission Type Toggle */}
        <div className="flex justify-center mb-8">
          <div className="flex border-2 border-accent rounded-lg p-1">
            <button
              onClick={() => setSubmissionType('spec')}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${submissionType === 'spec' ? 'bg-accent text-white' : 'text-accent'}`}
            >
              <FileText size={16} className="mr-2"/> Spec
            </button>
            <button
              onClick={() => setSubmissionType('plugin')}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${submissionType === 'plugin' ? 'bg-accent text-white' : 'text-accent'}`}
            >
              <Plug size={16} className="mr-2"/> Plugin
            </button>
          </div>
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
             <p className="text-sm text-dark-gray mt-2">
              {submissionType === 'spec'
                ? "Repository must contain a `spec.toml` file in the root."
                : "Repository must contain a `Cargo.toml` file in the root."}
            </p>
          </div>

          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
          {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{success}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-red-700 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Submitting...' : `Submit ${submissionType === 'spec' ? 'Spec' : 'Plugin'}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitPage;
