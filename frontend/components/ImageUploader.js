import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const ImageUploader = ({ onImageUpload, isProcessing, disabled }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, BMP, or TIFF)');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    toast.success('Image uploaded successfully!');
    onImageUpload(file);
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.bmp', '.tiff']
    },
    maxFiles: 1,
    disabled: disabled || isProcessing
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'dropzone-active' : ''} ${
          disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        data-testid="dropzone"
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          {isDragActive ? (
            <Upload className="w-12 h-12 text-primary-600" />
          ) : (
            <ImageIcon className="w-12 h-12 text-gray-400" />
          )}
          
          <div className="text-center">
            <p className="text-lg font-medium text-gray-700">
              {isDragActive 
                ? 'Drop your image here' 
                : 'Drag & drop an image here, or click to select'
              }
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Supports JPEG, PNG, BMP, TIFF (max 10MB)
            </p>
          </div>
        </div>
      </div>

      {isProcessing && (
        <div className="text-center py-4">
          <div className="loading-spinner mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Processing your image...</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Tips for best results:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use high-quality grayscale images</li>
          <li>• Ensure good contrast and lighting</li>
          <li>• Avoid heavily compressed images</li>
          <li>• For portraits, ensure faces are clearly visible</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUploader; 