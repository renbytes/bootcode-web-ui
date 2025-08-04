import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {
  return (
    <header className="bg-primary text-white">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          BootCode Hub
        </Link>
        <div className="flex items-center space-x-4">
          <Link to="/browse" className="hover:text-gray-300">Browse</Link>
          <Link to="/submit" className="hover:text-gray-300">Submit a Spec</Link>
          {user ? (
            <img src={user.avatarUrl} alt={user.username} className="w-8 h-8 rounded-full" />
          ) : (
            <div className="flex items-center space-x-2">
                <button className="font-semibold hover:text-gray-300">Sign In</button>
                <button className="bg-accent hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                    Sign Up
                </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
