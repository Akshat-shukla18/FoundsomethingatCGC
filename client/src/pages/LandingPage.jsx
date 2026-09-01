import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import BounceCards from '../components/BounceCards/BounceCards';
import Lanyard from '../components/Lanyard/Lanyard';
import lanyardCardFace from '../assets/lanyard-card-face.png';

const images = [
  "https://picsum.photos/400/400?grayscale",
  "https://picsum.photos/500/500?grayscale",
  "https://picsum.photos/600/600?grayscale",
  "https://picsum.photos/700/700?grayscale",
  "https://picsum.photos/300/300?grayscale"
];

const transformStyles = [
  "rotate(5deg) translate(-150px)",
  "rotate(0deg) translate(-70px)",
  "rotate(-5deg)",
  "rotate(5deg) translate(70px)",
  "rotate(-5deg) translate(150px)"
];

export const LandingPage = () => {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        await authService.getMe();
        // Logged-in user should see /home, not landing
        navigate('/home', { replace: true });
      } catch {
        // Not logged in
      } finally {
        setCheckingAuth(false);
      }
    };
    fetchUser();
  }, [navigate]);

  if (checkingAuth) return null; // brief loading check

  return (
    <div className="fixed inset-0 z-20 w-full h-full flex flex-col items-center justify-between overflow-y-auto overflow-x-hidden text-white pt-24 pb-8 px-4">
      {/* Transparent Navbar */}
      <nav className="absolute top-0 w-full z-50 px-6 py-6 flex justify-between items-start bg-transparent pointer-events-none">
        <div className="relative pointer-events-auto flex flex-col items-start">
          <Link to="/" className="font-bold text-2xl tracking-tight">
            Campus<span className="text-red-500">Lost</span>&<span className="text-indigo-400">Found</span>
          </Link>
          
          {/* Interactive 3D Lanyard hanging under the logo with custom uploaded image face */}
          <div className="w-48 h-64 mt-2 -ml-6 relative overflow-visible z-40">
            <Lanyard 
              position={[0, 0, 20]} 
              gravity={[0, -40, 0]} 
              frontImage={lanyardCardFace}
              backImage={lanyardCardFace}
              imageFit="cover"
            />
          </div>
        </div>

        <div className="flex gap-6 items-center text-sm font-medium pointer-events-auto">
          <Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link>
          <Link to="/register" className="hover:text-indigo-400 transition-colors">Register</Link>
          <Link to="/login" className="hover:text-indigo-400 transition-colors">Login</Link>
          <Link to="/feedback" className="hover:text-indigo-400 transition-colors">Feedback</Link>
          <Link to="/contact" className="hover:text-indigo-400 transition-colors">Contact</Link>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 text-center max-w-3xl flex flex-col items-center my-auto">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 drop-shadow-lg">
          Campus <span className="text-red-500">Lost</span> & <span className="text-indigo-400">Found</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl drop-shadow-md">
          The central hub to report lost items and search for things found across the college campus.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-10">
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

        {/* BounceCards Component under the buttons */}
        <div className="flex justify-center items-center my-4 overflow-visible">
          <BounceCards
            className="custom-bounceCards"
            images={images}
            containerWidth={500}
            containerHeight={250}
            animationDelay={1}
            animationStagger={0.08}
            easeType="elastic.out(1, 0.5)"
            transformStyles={transformStyles}
            enableHover={false}
          />
        </div>
      </div>
      
      <div className="z-10 text-gray-400 text-sm drop-shadow-sm mt-4">
        Lost it? Find it. Found it? Return it.
      </div>
    </div>
  );
};
