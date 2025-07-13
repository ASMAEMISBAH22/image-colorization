import { Palette, Github, Info } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI Colorizer</h1>
              <p className="text-xs text-gray-500">Powered by U-Net</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a
              href="#features"
              className="text-gray-600 hover:text-primary-600 transition-colors duration-200"
            >
              Features
            </a>
            <a
              href="#about"
              className="text-gray-600 hover:text-primary-600 transition-colors duration-200"
            >
              About
            </a>
            <a
              href="https://github.com/your-username/image-colorization"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-primary-600 transition-colors duration-200 flex items-center space-x-1"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 