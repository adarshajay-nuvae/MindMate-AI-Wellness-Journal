import React, { useEffect, useState } from 'react';
import { BrainIcon, FileTextIcon, LightBulbIcon, ChartBarIcon } from '../../constants';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const FloatingCard = ({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) => (
    <div 
      className={`floating-card ${className}`}
      style={{
        transform: `translateY(${Math.sin(Date.now() * 0.001 + delay) * 10}px) rotateX(${mousePosition.y * 5}deg) rotateY(${mousePosition.x * 5}deg)`,
        transition: 'transform 0.1s ease-out',
      }}
    >
      {children}
    </div>
  );

  const ParallaxSection = ({ children, speed = 0.5, className = '' }: { children: React.ReactNode; speed?: number; className?: string }) => (
    <div 
      className={className}
      style={{
        transform: `translateY(${scrollY * speed}px)`,
      }}
    >
      {children}
    </div>
  );

  return (
    <div className="landing-page overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <ParallaxSection speed={0.2} className="absolute top-20 left-10">
            <div className="w-32 h-32 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
          </ParallaxSection>
          <ParallaxSection speed={0.3} className="absolute top-40 right-20">
            <div className="w-24 h-24 bg-purple-400/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </ParallaxSection>
          <ParallaxSection speed={0.4} className="absolute bottom-40 left-1/4">
            <div className="w-40 h-40 bg-pink-400/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          </ParallaxSection>
        </div>

        {/* Main Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <FloatingCard className="mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
              <BrainIcon className="w-24 h-24 text-white mx-auto relative z-10" />
            </div>
          </FloatingCard>
          
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              MindMate
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed">
            Your AI-powered wellness companion for emotional reflection and mental clarity
          </p>
          
          <FloatingCard delay={1}>
            <button
              onClick={onGetStarted}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg rounded-full hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25"
            >
              <span className="relative z-10">Start Your Journey</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            </button>
          </FloatingCard>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 bg-gradient-to-b from-gray-50 to-white">
        <ParallaxSection speed={0.1} className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/50 to-purple-50/50"></div>
        </ParallaxSection>

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Transform Your Mental Wellness
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover insights about your emotional patterns with AI-powered analysis and personalized guidance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FloatingCard delay={0} className="feature-card">
              <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <FileTextIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Smart Journaling</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Write freely about your thoughts and feelings. Our AI understands context and provides meaningful insights.
                </p>
              </div>
            </FloatingCard>

            <FloatingCard delay={1} className="feature-card">
              <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <BrainIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Mood Analysis</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Get detailed emotional analysis and identify patterns in your mental state over time.
                </p>
              </div>
            </FloatingCard>

            <FloatingCard delay={2} className="feature-card">
              <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <LightBulbIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Personalized Tips</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Receive tailored wellness advice and reflection prompts based on your unique emotional journey.
                </p>
              </div>
            </FloatingCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <ParallaxSection speed={0.2}>
          <div className="absolute inset-0 bg-black/20"></div>
        </ParallaxSection>
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <FloatingCard>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Begin Your Wellness Journey?
            </h2>
            <p className="text-xl text-gray-200 mb-8">
              Join thousands who have transformed their mental wellness with MindMate
            </p>
            <button
              onClick={onGetStarted}
              className="group relative px-10 py-5 bg-white text-purple-600 font-bold text-xl rounded-full hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              <span className="relative z-10">Get Started Free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>
          </FloatingCard>
        </div>
      </section>

      <style jsx>{`
        .landing-page {
          perspective: 1000px;
        }
        
        .floating-card {
          transform-style: preserve-3d;
        }
        
        .feature-card {
          transform-style: preserve-3d;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;