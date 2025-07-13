import { useState, useEffect } from 'react';

const ProgressBar = ({ progress, className = '' }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);

    return () => clearTimeout(timer);
  }, [progress]);

  const getProgressColor = (progress) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getProgressText = (progress) => {
    if (progress < 20) return 'Initializing...';
    if (progress < 40) return 'Processing image...';
    if (progress < 60) return 'Applying AI colorization...';
    if (progress < 80) return 'Enhancing colors...';
    if (progress < 100) return 'Finalizing...';
    return 'Complete!';
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          {getProgressText(progress)}
        </span>
        <span className="text-sm font-medium text-gray-700">
          {Math.round(animatedProgress)}%
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-out ${getProgressColor(progress)}`}
          style={{ width: `${animatedProgress}%` }}
        />
      </div>
      
      {/* Progress steps */}
      <div className="flex justify-between mt-3">
        <div className={`text-xs ${progress >= 20 ? 'text-green-600' : 'text-gray-400'}`}>
          Upload
        </div>
        <div className={`text-xs ${progress >= 40 ? 'text-green-600' : 'text-gray-400'}`}>
          Process
        </div>
        <div className={`text-xs ${progress >= 60 ? 'text-green-600' : 'text-gray-400'}`}>
          Colorize
        </div>
        <div className={`text-xs ${progress >= 80 ? 'text-green-600' : 'text-gray-400'}`}>
          Enhance
        </div>
        <div className={`text-xs ${progress >= 100 ? 'text-green-600' : 'text-gray-400'}`}>
          Complete
        </div>
      </div>
    </div>
  );
};

export default ProgressBar; 