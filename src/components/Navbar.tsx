import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';
import { supabase } from '../supabaseClient';
import { ChevronDown, FileText, Plug } from 'lucide-react';

/**
 * A dropdown menu component that appears on hover.
 * The main title is a link, and the children are the dropdown items.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The items to display in the dropdown.
 */
const Dropdown: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* The main "Browse" text is now a link that also acts as the hover trigger */}
      <Link to="/browse" className="flex items-center hover:text-gray-300 focus:outline-none">
        Browse
        <ChevronDown size={16} className={`ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Link>
      
      {/* The dropdown menu appears below the link */}
      {isOpen && (
        <div 
          className="absolute mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
        >
          {children}
        </div>
      )}
    </div>
  );
};


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
    <header className="bg-primary text-white shadow-md">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold hover:text-gray-300 transition-colors">
          Spex Hub
        </Link>
        <div className="flex items-center space-x-6">
          {/* The Dropdown component now encapsulates the browse link and its menu */}
          <Dropdown>
            <Link to="/browse?type=specs" className="flex items-center px-4 py-2 text-sm text-primary hover:bg-light-gray">
              <FileText size={16} className="mr-2"/> Specs
            </Link>
            <Link to="/browse?type=plugins" className="flex items-center px-4 py-2 text-sm text-primary hover:bg-light-gray">
              <Plug size={16} className="mr-2"/> Plugins
            </Link>
          </Dropdown>
          <Link to="/submit" className="hover:text-gray-300">Submit</Link>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <img src={user.avatarUrl} alt={user.username} className="w-8 h-8 rounded-full border-2 border-accent" />
              <span className="font-semibold">{user.username}</span>
              <button onClick={handleLogout} className="font-semibold hover:text-gray-300">
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="bg-accent hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
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
