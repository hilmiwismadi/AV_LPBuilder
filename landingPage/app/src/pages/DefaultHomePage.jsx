import { Link } from 'react-router-dom';
import { FaRocket, FaPalette, FaCode, FaGlobe, FaArrowRight } from 'react-icons/fa';
import { useState, useEffect } from 'react';

const DefaultHomePage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const gradientBg = "radial-gradient(circle at " + mousePosition.x + "% " + mousePosition.y + "%, rgba(6, 182, 212, 0.08) 0%, rgba(255, 255, 255, 1) 50%, rgba(34, 211, 238, 0.05) 100%)";
  return (
    <>
      <style>{`@keyframes gradientShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}@keyframes float{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-20px) rotate(5deg)}}@keyframes patternMove{0%{transform:translateY(0)}100%{transform:translateY(30px)}}`}</style>
      <div className="min-h-screen relative overflow-hidden" style={{ background: gradientBg, fontFamily: 'Inter, sans-serif' }}>
        <div className="absolute inset-0 -z-10" style={{ background: "linear-gradient(135deg, #06B6D4 0%, #22D3EE 50%, #06B6D4 100%)", backgroundSize: "400% 400%", animation: "gradientShift 15s ease infinite", opacity: 0.03 }} />
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full blur-3xl" style={{ width: "600px", height: "600px", background: "radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)", top: "-200px", right: "-200px", animation: "float 20s ease-in-out infinite" }} />
        <div className="absolute rounded-full blur-3xl" style={{ width: "500px", height: "500px", background: "radial-gradient(circle, rgba(34, 211, 238, 0.12) 0%, transparent 70%)", bottom: "-150px", left: "-150px", animation: "float 25s ease-inout infinite reverse" }} />
      </div>
      {/* Header/Nav */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>
              WebBuild <span style={{ color: '#06B6D4' }}>ArachnoVa</span>
            </h1>
            <Link
              to="/configuration"
              className="px-6 py-2 rounded-lg hover:opacity-90 transition-colors text-white font-semibold"
              style={{ 
                background: 'linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 
            className="text-5xl font-extrabold mb-6"
            style={{ 
              color: '#0A0E1A',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 800,
              letterSpacing: '-0.02em'
            }}
          >
            Create Beautiful Landing Pages
            <br />
            <span style={{ color: '#06B6D4' }}>In Minutes, Not Hours</span>
          </h2>
          <p 
            className="text-xl mb-10 max-w-3xl mx-auto"
            style={{ 
              color: '#64748B',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            Build stunning, customizable landing pages for your events, competitions, 
            or projects with our powerful drag-and-drop builder. Each page gets its own subdomain.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/configuration"
              className="px-8 py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition-opacity shadow-lg text-white"
              style={{ 
                background: 'linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)',
                fontFamily: 'Inter, sans-serif',
                boxShadow: '0 4px 15px rgba(6, 182, 212, 0.3)'
              }}
            >
              Create Your Page
            </Link>
            <Link
              to="/saved"
              className="px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg border-2 text-white"
              style={{ 
                borderColor: '#06B6D4',
                color: '#06B6D4',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              View Examples
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4" style={{ color: '#06B6D4' }}>
              <FaRocket />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#0A0E1A', fontFamily: 'Inter, sans-serif' }}>
              Fast Setup
            </h3>
            <p style={{ color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
              Create and launch your landing page in minutes with our intuitive builder.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4" style={{ color: '#22D3EE' }}>
              <FaPalette />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#0A0E1A', fontFamily: 'Inter, sans-serif' }}>
              Fully Customizable
            </h3>
            <p style={{ color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
              Customize colors, images, layouts, and content to match your brand.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4" style={{ color: '#0891B2' }}>
              <FaGlobe />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#0A0E1A', fontFamily: 'Inter, sans-serif' }}>
              Unique Subdomain
            </h3>
            <p style={{ color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
              Each page gets its own subdomain: yourname.webbuild.arachnova.id
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4" style={{ color: '#06B6D4' }}>
              <FaCode />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#0A0E1A', fontFamily: 'Inter, sans-serif' }}>
              No Coding Required
            </h3>
            <p style={{ color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
              Build professional pages without writing a single line of code.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div 
          className="mt-24 rounded-2xl p-12 text-center text-white"
          style={{ 
            background: 'linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          <h3 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
            Ready to Build Your Landing Page?
          </h3>
          <p className="text-xl mb-8 opacity-90" style={{ fontFamily: 'Inter, sans-serif' }}>
            Join hundreds of creators who trust WebBuild for their events and competitions.
          </p>
          <Link
            to="/configuration"
            className="bg-white px-10 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
            style={{ 
              color: '#06B6D4',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            Start Building Now - It's Free!
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-white mt-20" style={{ backgroundColor: '#0A0E1A', fontFamily: 'Inter, sans-serif' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p style={{ color: '#94A3B8' }}>
            © 2026 WebBuild ArachnoVa. Built with ❤️ for creators.
          </p>
        </div>
      </footer>
      </div>
    </>
  );
};

export default DefaultHomePage;
