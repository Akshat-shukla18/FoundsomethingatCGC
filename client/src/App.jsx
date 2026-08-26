import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header/Header';
import { LostPage } from './pages/LostPage';
import { FoundPage } from './pages/FoundPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Navigate to="/lost" replace />} />
            <Route path="/lost" element={<LostPage />} />
            <Route path="/found" element={<FoundPage />} />
            {/* Add more routes in the future: /login, /register, /reports/:id */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
