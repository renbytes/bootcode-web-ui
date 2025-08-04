import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';
import { supabase } from '../supabaseClient';

interface NavbarProps {
  user: User | null;
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="bg-primary text-white">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          Spex Hub
        </Link>
        <div className="flex items-center space-x-4">
          <Link to="/browse" className="hover:text-gray-300">Browse</Link>
          <Link to="/submit" className="hover:text-gray-300">Submit a Spec</Link>
          {user ? (
            <div className="flex items-center space-x-4">
              <img src={user.avatarUrl} alt={user.username} className="w-8 h-8 rounded-full" />
              <span>{user.username}</span>
              <button onClick={handleLogout} className="font-semibold hover:text-gray-300">
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="bg-accent hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Login with GitHub
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;