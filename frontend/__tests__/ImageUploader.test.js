import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImageUploader from '../components/ImageUploader';

// Mock react-dropzone
jest.mock('react-dropzone', () => ({
  useDropzone: () => ({
    getRootProps: () => ({}),
    getInputProps: () => ({}),
    isDragActive: false,
  }),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

describe('ImageUploader', () => {
  const mockOnImageUpload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders upload area', () => {
    render(
      <ImageUploader 
        onImageUpload={mockOnImageUpload}
        isProcessing={false}
        disabled={false}
      />
    );

    expect(screen.getByText(/Drag & drop an image here/)).toBeInTheDocument();
    expect(screen.getByText(/Supports JPEG, PNG, BMP, TIFF/)).toBeInTheDocument();
  });

  it('shows processing state when isProcessing is true', () => {
    render(
      <ImageUploader 
        onImageUpload={mockOnImageUpload}
        isProcessing={true}
        disabled={false}
      />
    );

    expect(screen.getByText(/Processing your image/)).toBeInTheDocument();
  });

  it('shows tips for best results', () => {
    render(
      <ImageUploader 
        onImageUpload={mockOnImageUpload}
        isProcessing={false}
        disabled={false}
      />
    );

    expect(screen.getByText(/Tips for best results/)).toBeInTheDocument();
    expect(screen.getByText(/Use high-quality grayscale images/)).toBeInTheDocument();
  });

  it('applies disabled styles when disabled', () => {
    render(
      <ImageUploader 
        onImageUpload={mockOnImageUpload}
        isProcessing={false}
        disabled={true}
      />
    );

    const dropzone = screen.getByTestId('dropzone');
    expect(dropzone).toHaveClass('opacity-50');
  });

  it('applies disabled styles when processing', () => {
    render(
      <ImageUploader 
        onImageUpload={mockOnImageUpload}
        isProcessing={true}
        disabled={false}
      />
    );

    const dropzone = screen.getByTestId('dropzone');
    expect(dropzone).toHaveClass('opacity-50');
  });
}); 