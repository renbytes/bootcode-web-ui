import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Use alias-based imports, which are cleaner and more maintainable.
// 'components/' and 'pages/' are resolved from the 'src/' directory.
import Navbar from 'components/Navbar';
import Home from 'pages/Home';
import SpecPage from 'pages/SpecPage';

const App: React.FC = () => {
  // In a real app, user state would come from a context or store
  const currentUser = null; 

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar user={currentUser} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/spec/:id" element={<SpecPage />} />
            {/* Add other routes for browse, submit, etc. later */}
          </Routes>
        </main>
        <footer className="bg-primary text-white text-center p-4 mt-auto">
            BootCode Community Hub © 2025
        </footer>
      </div>
    </Router>
  );
};

export default App;
