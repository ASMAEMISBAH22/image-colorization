import { useState, useCallback } from 'react';
import Head from 'next/head';
import ImageUploader from '../components/ImageUploader';
import ImagePreview from '../components/ImagePreview';
import ProgressBar from '../components/ProgressBar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useColorization } from '../hooks/useColorization';

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [colorizedImage, setColorizedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const { colorizeImage, checkProgress } = useColorization();

  const handleImageUpload = useCallback(async (file) => {
    setUploadedImage(file);
    setColorizedImage(null);
    setIsProcessing(true);
    setProgress(0);

    try {
      const result = await colorizeImage(file);
      setColorizedImage(result);
      setProgress(100);
    } catch (error) {
      console.error('Colorization failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [colorizeImage]);

  const handleReset = useCallback(() => {
    setUploadedImage(null);
    setColorizedImage(null);
    setProgress(0);
    setIsProcessing(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Head>
        <title>AI Image Colorization - Transform Grayscale to Color</title>
        <meta name="description" content="AI-powered image colorization using advanced U-Net deep learning model. Transform your grayscale photos into vibrant color images instantly." />
        <meta name="keywords" content="AI, image colorization, deep learning, U-Net, grayscale to color" />
      </Head>

      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gradient mb-4">
            AI Image Colorization
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your grayscale photos into vibrant color images using advanced AI technology
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="card">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                Upload Image
              </h2>
              <ImageUploader 
                onImageUpload={handleImageUpload}
                isProcessing={isProcessing}
                disabled={isProcessing}
              />
              
              {isProcessing && (
                <div className="mt-6">
                  <ProgressBar progress={progress} />
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    Processing your image with AI...
                  </p>
                </div>
              )}
            </div>

            {/* Preview Section */}
            <div className="card">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                Results
              </h2>
              <ImagePreview 
                originalImage={uploadedImage}
                colorizedImage={colorizedImage}
                isProcessing={isProcessing}
                onReset={handleReset}
              />
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
              Why Choose Our AI Colorization?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
                <p className="text-gray-600">Get your colorized images in seconds with our optimized AI model</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">High Quality</h3>
                <p className="text-gray-600">Advanced U-Net architecture ensures realistic and detailed colorization</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
                <p className="text-gray-600">Your images are processed securely and never stored permanently</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 