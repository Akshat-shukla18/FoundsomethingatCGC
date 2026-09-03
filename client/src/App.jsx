import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
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
import { HomePage } from './pages/HomePage';
import { PageTransition } from './components/PageTransition/PageTransition';
import LightRays from './components/LightRays/LightRays';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
      <Route path="/home" element={<PageTransition><HomePage /></PageTransition>} />
      <Route path="/lost" element={<PageTransition><LostPage /></PageTransition>} />
      <Route path="/found" element={<PageTransition><FoundPage /></PageTransition>} />
      <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
      <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
      <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
      <Route path="/feedback" element={<PageTransition><FeedbackPage /></PageTransition>} />
      <Route path="/reports/create" element={<PageTransition><ReportForm /></PageTransition>} />
      <Route path="/admin" element={<PageTransition><AdminDashboard /></PageTransition>} />
    </Routes>
  );
};

const AppContent = () => {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col relative ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Global LightRays Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <LightRays
          raysOrigin="top-center"
          raysColor={isDark ? '#ffffff' : '#6366f1'}
          raysSpeed={1}
          lightSpread={0.5}
          rayLength={3}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0}
          distortion={0}
          pulsating={false}
          fadeDistance={1}
          saturation={isDark ? 1 : 0.4}
        />
      </div>

      {/* Content on top of background */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex flex-col">
          <AnimatedRoutes />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
