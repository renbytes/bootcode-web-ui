import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Github, FileText, Plug } from 'lucide-react';

type SubmissionType = 'spec' | 'plugin';

/**
 * A reusable component for the large clickable selection cards.
 * It now visually adapts based on whether it's selected or another option is.
 * @param {object} props - The component props.
 */
const SubmissionChoice: React.FC<{
  type: SubmissionType;
  icon: React.ReactNode;
  title: string;
  description: string;
  onSelect: () => void;
  isSelected: boolean;
  isDisabled: boolean;
}> = ({ type, icon, title, description, onSelect, isSelected, isDisabled }) => {
  const baseClasses = "flex-1 p-8 border-2 rounded-lg text-center transition-all duration-200";
  const stateClasses = isSelected
    ? 'border-accent bg-light-gray'
    : isDisabled
    ? 'opacity-50 cursor-not-allowed'
    : 'border-medium-gray cursor-pointer hover:border-accent hover:bg-light-gray';

  return (
    <div
      onClick={onSelect}
      className={`${baseClasses} ${stateClasses}`}
    >
      <div className="w-16 h-16 mx-auto bg-accent text-white rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h2 className="text-2xl font-bold text-primary">{title}</h2>
      <p className="text-dark-gray mt-2">{description}</p>
    </div>
  );
};

/**
 * The form component for submitting a GitHub URL.
 * It's now simpler and doesn't handle navigation back.
 * @param {object} props - The component props.
 * @param {SubmissionType} props.type - The type of submission ('spec' or 'plugin').
 */
const SubmissionForm: React.FC<{ type: SubmissionType }> = ({ type }) => {
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

    const functionName = type === 'spec' 
      ? 'submit-spec-from-github' 
      : 'submit-plugin-from-github';

    try {
      const { data, error: invokeError } = await supabase.functions.invoke(functionName, {
        body: { githubUrl },
      });

      if (invokeError) throw invokeError;
      
      const newId = data.data.id;
      setSuccess('Submission successful! Redirecting...');
      setTimeout(() => navigate(type === 'spec' ? `/spec/${newId}` : `/plugin/${newId}`), 2000);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="githubUrl" className="block text-primary font-bold mb-2 text-left">
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
        <p className="text-sm text-dark-gray mt-2 text-left">
          {type === 'spec'
            ? <>Repository must contain a <code className="font-mono bg-gray-200 p-1 rounded-md">spec.toml</code> file in the root.</>
            : <>Repository must contain a plugin manifest (e.g., <code className="font-mono bg-gray-200 p-1 rounded-md">Cargo.toml</code>, <code className="font-mono bg-gray-200 p-1 rounded-md">pyproject.toml</code>) in the root.</>}
        </p>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{success}</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-accent hover:bg-red-700 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:bg-gray-400"
      >
        {loading ? 'Submitting...' : `Submit ${type === 'spec' ? 'Spec' : 'Plugin'}`}
      </button>
    </form>
  );
};

/**
 * The main page component that controls the submission flow on a single page.
 */
const SubmitPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<SubmissionType | null>(null);

  /**
   * Handles the selection of a submission type.
   * If the clicked type is already selected, it deselects it.
   * Otherwise, it selects the new type.
   * @param {SubmissionType} type - The type that was clicked.
   */
  const handleSelect = (type: SubmissionType) => {
    if (selectedType === type) {
      setSelectedType(null); // Deselect if clicking the same one again
    } else {
      setSelectedType(type);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <div className="bg-white p-8 md:p-12 rounded-lg shadow-lg border border-medium-gray">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-primary">What would you like to submit?</h1>
          <p className="text-dark-gray mt-2 text-lg">Choose a submission type to get started.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          <SubmissionChoice
            type="spec"
            icon={<FileText size={32} />}
            title="Submit a Spec"
            description="Share a reusable `spec.toml` file for generating projects."
            onSelect={() => handleSelect('spec')}
            isSelected={selectedType === 'spec'}
            isDisabled={selectedType !== null && selectedType !== 'spec'}
          />
          <SubmissionChoice
            type="plugin"
            icon={<Plug size={32} />}
            title="Submit a Plugin"
            description="Add a new language plugin (e.g., `boot-rust`) to the ecosystem."
            onSelect={() => handleSelect('plugin')}
            isSelected={selectedType === 'plugin'}
            isDisabled={selectedType !== null && selectedType !== 'plugin'}
          />
        </div>

        {/* Conditionally render the form below the choices with a smooth transition */}
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${selectedType ? 'max-h-96 mt-10' : 'max-h-0'}`}>
          {selectedType && <SubmissionForm type={selectedType} />}
        </div>
      </div>
    </div>
  );
};

export default SubmitPage;
