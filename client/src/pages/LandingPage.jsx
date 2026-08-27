import { Link } from 'react-router-dom';
import LightRays from '../components/LightRays/LightRays';

export const LandingPage = () => {
  return (
    <div className="fixed inset-0 z-50 w-full h-full flex items-center justify-center overflow-hidden bg-black text-white">
      {/* Transparent Navbar */}
      <nav className="absolute top-0 w-full z-50 px-6 py-6 flex justify-between items-center bg-transparent">
        <Link to="/" className="font-bold text-2xl tracking-tight">
          Campus<span className="text-red-500">Lost</span>&<span className="text-indigo-400">Found</span>
        </Link>
        <div className="flex gap-6 items-center text-sm font-medium">
          <Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link>
          <Link to="/register" className="hover:text-indigo-400 transition-colors">Register</Link>
          <Link to="/login" className="hover:text-indigo-400 transition-colors">Login</Link>
          <Link to="/feedback" className="hover:text-indigo-400 transition-colors">Feedback</Link>
          <Link to="/contact" className="hover:text-indigo-400 transition-colors">Contact</Link>
        </div>
      </nav>

      {/* LightRays Background */}
      <div className="absolute inset-0 z-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffff"
          raysSpeed={1}
          lightSpread={0.5}
          rayLength={3}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0}
          distortion={0}
          className="custom-rays"
          pulsating={false}
          fadeDistance={1}
          saturation={1}
        />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 text-center max-w-3xl px-4 flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 drop-shadow-lg">
          Campus <span className="text-red-500">Lost</span> & <span className="text-indigo-400">Found</span>
        </h1>
        <p className="text-lg md:text-2xl text-gray-200 mb-10 max-w-2xl drop-shadow-md">
          The central hub to report lost items and search for things found across the college campus.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link 
            to="/lost" 
            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full text-lg shadow-xl hover:shadow-red-500/30 transition-all transform hover:-translate-y-1"
          >
            I Lost Something
          </Link>
          <Link 
            to="/found" 
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full text-lg shadow-xl hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-1"
          >
            I Found Something
          </Link>
        </div>
      </div>
      
      <div className="absolute bottom-8 z-10 text-gray-400 text-sm drop-shadow-sm">
        Move your mouse to interact with the light rays
      </div>
    </div>
  );
};

