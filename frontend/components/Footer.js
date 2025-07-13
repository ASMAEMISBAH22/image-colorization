import { Heart, Github, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold">AI Colorizer</h3>
                <p className="text-sm text-gray-400">Powered by U-Net Deep Learning</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Transform your grayscale photos into vibrant color images using advanced AI technology. 
              Built with Next.js, FastAPI, and PyTorch.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/your-username/image-colorization"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com/your-username"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="mailto:contact@example.com"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Features
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-400 hover:text-white transition-colors duration-200">
                  About
                </a>
              </li>
              <li>
                <a href="#api" className="text-gray-400 hover:text-white transition-colors duration-200">
                  API Documentation
                </a>
              </li>
              <li>
                <a href="#privacy" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Technology */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Technology</h4>
            <ul className="space-y-2">
              <li className="text-gray-400">Next.js</li>
              <li className="text-gray-400">FastAPI</li>
              <li className="text-gray-400">PyTorch</li>
              <li className="text-gray-400">U-Net Model</li>
              <li className="text-gray-400">Tailwind CSS</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 AI Colorizer. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm flex items-center mt-2 md:mt-0">
            Made with <Heart className="w-4 h-4 mx-1 text-red-500" /> by AI enthusiasts
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 