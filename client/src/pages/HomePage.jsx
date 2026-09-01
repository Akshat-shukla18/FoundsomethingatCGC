import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import BounceCards from '../components/BounceCards/BounceCards';

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

export const HomePage = () => {
  const { isDark } = useTheme();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 text-center flex flex-col items-center">
      <h1 className={`text-5xl md:text-6xl font-extrabold tracking-tight mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Campus <span className="text-red-500">Lost</span> & <span className="text-indigo-400">Found</span>
      </h1>
      <p className={`text-lg md:text-xl mb-8 max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        Report lost items or browse found items across the college campus.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
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

      {/* BounceCards Component for Logged-In Home Page */}
      <div className="flex justify-center items-center my-4 overflow-visible">
        <BounceCards
          className="custom-bounceCards"
          images={images}
          containerWidth={500}
          containerHeight={250}
          animationDelay={0.5}
          animationStagger={0.08}
          easeType="elastic.out(1, 0.5)"
          transformStyles={transformStyles}
          enableHover={false}
        />
      </div>
    </div>
  );
};
