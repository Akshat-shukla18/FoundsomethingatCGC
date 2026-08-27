import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header/Header';
import { LostPage } from './pages/LostPage';
import { FoundPage } from './pages/FoundPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ReportForm } from './pages/ReportForm';
import { AdminDashboard } from './pages/AdminDashboard';
import { LandingPage } from './pages/LandingPage';
import { ContactPage } from './pages/ContactPage';
import { FeedbackPage } from './pages/FeedbackPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/lost" element={<LostPage />} />
            <Route path="/found" element={<FoundPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/reports/create" element={<ReportForm />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
