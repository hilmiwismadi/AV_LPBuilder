import { Link } from 'react-router-dom';
import { FaRocket, FaPalette, FaCode, FaGlobe } from 'react-icons/fa';

const DefaultHomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header/Nav */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              WebBuild <span className="text-blue-600">Arachnova</span>
            </h1>
            <Link
              to="/configuration"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-6">
            Create Beautiful Landing Pages
            <br />
            <span className="text-blue-600">In Minutes, Not Hours</span>
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Build stunning, customizable landing pages for your events, competitions, 
            or projects with our powerful drag-and-drop builder. Each page gets its own subdomain.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/configuration"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
            >
              Create Your Page
            </Link>
            <Link
              to="/saved"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg border-2 border-blue-600"
            >
              View Examples
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-blue-600 text-4xl mb-4">
              <FaRocket />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Fast Setup</h3>
            <p className="text-gray-600">
              Create and launch your landing page in minutes with our intuitive builder.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-purple-600 text-4xl mb-4">
              <FaPalette />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Fully Customizable</h3>
            <p className="text-gray-600">
              Customize colors, images, layouts, and content to match your brand.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-green-600 text-4xl mb-4">
              <FaGlobe />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Unique Subdomain</h3>
            <p className="text-gray-600">
              Each page gets its own subdomain: yourname.webbuild.arachnova.id
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-orange-600 text-4xl mb-4">
              <FaCode />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Coding Required</h3>
            <p className="text-gray-600">
              Build professional pages without writing a single line of code.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Ready to Build Your Landing Page?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of creators who trust WebBuild for their events and competitions.
          </p>
          <Link
            to="/configuration"
            className="bg-white text-blue-600 px-10 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
          >
            Start Building Now - It's Free!
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-gray-400">
            © 2026 WebBuild Arachnova. Built with ❤️ for creators.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DefaultHomePage;
