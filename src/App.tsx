import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { User as AppUser } from './types';
import { User as SupabaseUser } from '@supabase/supabase-js';

import Navbar from 'components/Navbar';
import Home from 'pages/Home';
import SpecPage from 'pages/SpecPage';
import BrowsePage from 'pages/BrowsePage'; // New
import SubmitSpecPage from 'pages/SubmitSpecPage'; // New

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

  const mapSupabaseUserToAppUser = async (supabaseUser: SupabaseUser | null) => {
    if (supabaseUser) {
        // Fetch the username from the public.profiles table
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', supabaseUser.id)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
            console.error('Error fetching profile:', error);
        }

      const appUser: AppUser = {
        id: supabaseUser.id,
        username: profile?.username || supabaseUser.user_metadata.user_name || 'N/A',
        avatarUrl: profile?.avatar_url || supabaseUser.user_metadata.avatar_url || '',
      };
      setCurrentUser(appUser);
    } else {
      setCurrentUser(null);
    }
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-light-gray font-sans">
        <Navbar user={currentUser} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/spec/:id" element={<SpecPage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/submit" element={<SubmitSpecPage />} />
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
