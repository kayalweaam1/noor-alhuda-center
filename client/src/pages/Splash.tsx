import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function Splash() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to login after 3 seconds
    const timer = setTimeout(() => {
      setLocation('/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 animate-gradient">
      <div className="animate-fade-in">
        <img 
          src="/assets/splash-logo.png" 
          alt="مركز نور الهدى" 
          className="w-full max-w-md mx-auto drop-shadow-2xl animate-scale-in"
        />
      </div>
      
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scale-in {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-in-out;
        }
        
        .animate-scale-in {
          animation: scale-in 1.5s ease-out;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 6s ease infinite;
        }
      `}</style>
    </div>
  );
}

