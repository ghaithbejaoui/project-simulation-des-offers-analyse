import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Offers from './pages/Offers';
import Profiles from './pages/Profiles';
import Simulation from './pages/Simulation';
import Compare from './pages/Compare';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        {/* Navigation */}
        <nav className="bg-blue-600 text-white p-4">
          <div className="container mx-auto flex gap-6">
            <Link to="/" className="font-bold">Home</Link>
            <Link to="/offers">Offers</Link>
            <Link to="/profiles">Profiles</Link>
            <Link to="/simulation">Simulate</Link>
            <Link to="/compare">Compare</Link>
          </div>
        </nav>
        
        {/* Page Content */}
        <div className="container mx-auto p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/profiles" element={<Profiles />} />
            <Route path="/simulation" element={<Simulation />} />
            <Route path="/compare" element={<Compare />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
