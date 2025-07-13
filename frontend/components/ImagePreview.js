import { useState } from 'react';
import { Download, RefreshCw, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const ImagePreview = ({ originalImage, colorizedImage, isProcessing, onReset }) => {
  const [showOriginal, setShowOriginal] = useState(true);
  const [showColorized, setShowColorized] = useState(true);

  const handleDownload = async () => {
    if (!colorizedImage) return;

    try {
      const response = await fetch(colorizedImage.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `colorized_${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Image downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!originalImage && !colorizedImage) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye className="w-12 h-12 text-gray-400" />
        </div>
        <p className="text-gray-500">Upload an image to see the preview</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Original Image */}
      {originalImage && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-800 flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Original Image
            </h3>
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className="text-gray-500 hover:text-gray-700"
            >
              {showOriginal ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          {showOriginal && (
            <div className="relative">
              <img
                src={URL.createObjectURL(originalImage)}
                alt="Original"
                className="w-full h-64 object-cover rounded-lg border border-gray-200"
              />
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {originalImage.name} ({formatFileSize(originalImage.size)})
              </div>
            </div>
          )}
        </div>
      )}

      {/* Colorized Image */}
      {colorizedImage && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-800 flex items-center">
              <div className="w-5 h-5 mr-2 bg-gradient-to-r from-red-500 to-blue-500 rounded"></div>
              Colorized Image
            </h3>
            <button
              onClick={() => setShowColorized(!showColorized)}
              className="text-gray-500 hover:text-gray-700"
            >
              {showColorized ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          {showColorized && (
            <div className="relative">
              <img
                src={colorizedImage.url}
                alt="Colorized"
                className="w-full h-64 object-cover rounded-lg border border-gray-200"
              />
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                AI Colorized
              </div>
            </div>
          )}
        </div>
      )}

      {/* Processing State */}
      {isProcessing && (
        <div className="text-center py-8">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">AI is working its magic...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        {colorizedImage && (
          <button
            onClick={handleDownload}
            className="btn-primary flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </button>
        )}
        
        <button
          onClick={onReset}
          className="btn-secondary flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset
        </button>
      </div>

      {/* Comparison View */}
      {originalImage && colorizedImage && showOriginal && showColorized && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Side-by-Side Comparison</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Original</p>
              <img
                src={URL.createObjectURL(originalImage)}
                alt="Original"
                className="w-full h-32 object-cover rounded border"
              />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Colorized</p>
              <img
                src={colorizedImage.url}
                alt="Colorized"
                className="w-full h-32 object-cover rounded border"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagePreview; 