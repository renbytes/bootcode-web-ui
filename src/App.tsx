import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { User as AppUser } from './types';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

import Navbar from 'components/Navbar';
import Home from 'pages/Home';
import SpecPage from 'pages/SpecPage';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  useEffect(() => {
    // Check for an initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        mapSupabaseUserToAppUser(session.user);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        mapSupabaseUserToAppUser(session?.user ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const mapSupabaseUserToAppUser = (supabaseUser: SupabaseUser | null) => {
    if (supabaseUser) {
      const appUser: AppUser = {
        id: supabaseUser.id,
        username: supabaseUser.user_metadata.user_name || 'N/A',
        avatarUrl: supabaseUser.user_metadata.avatar_url || '',
      };
      setCurrentUser(appUser);
    } else {
      setCurrentUser(null);
    }
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar user={currentUser} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/spec/:id" element={<SpecPage />} />
          </Routes>
        </main>
        <footer className="bg-primary text-white text-center p-4 mt-auto">
            Spex Community Hub © 2025
        </footer>
      </div>
    </Router>
  );
};

export default App;