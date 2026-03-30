import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Offers from './pages/Offers';
import Profiles from './pages/Profiles';
import Simulation from './pages/Simulation';
import Compare from './pages/Compare';
import Login from './pages/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <BrowserRouter>
      {isAuthenticated && (
        <nav className="bg-blue-600 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex gap-6">
              <Link to="/" className="font-bold">Home</Link>
              <Link to="/offers">Offers</Link>
              <Link to="/profiles">Profiles</Link>
              <Link to="/simulation">Simulate</Link>
              <Link to="/compare">Compare</Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm">👤 {user?.username} ({user?.role})</span>
              <button onClick={handleLogout} className="bg-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-800">
                Logout
              </button>
            </div>
          </div>
        </nav>
      )}
      
      <div className="container mx-auto p-6">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
          <Route path="/offers" element={isAuthenticated ? <Offers /> : <Navigate to="/login" />} />
          <Route path="/profiles" element={isAuthenticated ? <Profiles /> : <Navigate to="/login" />} />
          <Route path="/simulation" element={isAuthenticated ? <Simulation /> : <Navigate to="/login" />} />
          <Route path="/compare" element={isAuthenticated ? <Compare /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
