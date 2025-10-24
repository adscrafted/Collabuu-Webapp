'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  value?: string;
  onChange: (file: File | null, previewUrl?: string) => void;
  onRemove?: () => void;
  error?: string;
  aspectRatio?: string;
  maxSizeMB?: number;
}

export function ImageUploader({
  value,
  onChange,
  onRemove,
  error,
  aspectRatio = '16:9',
  maxSizeMB = 5,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | undefined>(value);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (file: File | null) => {
      if (!file) {
        setPreview(undefined);
        onChange(null);
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      // Validate file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        alert(`File size must be less than ${maxSizeMB}MB`);
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewUrl = reader.result as string;
        setPreview(previewUrl);
        onChange(file, previewUrl);
      };
      reader.readAsDataURL(file);
    },
    [onChange, maxSizeMB]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileChange(files[0]);
      }
    },
    [handleFileChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(undefined);
    onChange(null);
    onRemove?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative">
          <div className="relative overflow-hidden rounded-lg border-2 border-gray-200">
            <img
              src={preview}
              alt="Campaign preview"
              className="h-64 w-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            'flex h-64 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
            isDragging
              ? 'border-pink-500 bg-pink-50'
              : 'border-gray-300 hover:border-pink-400 hover:bg-gray-50',
            error && 'border-red-300'
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          />
          <div className="flex flex-col items-center space-y-4 p-6 text-center">
            {isDragging ? (
              <Upload className="h-12 w-12 text-pink-500" />
            ) : (
              <ImageIcon className="h-12 w-12 text-gray-400" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">
                {isDragging ? 'Drop your image here' : 'Upload campaign image'}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Drag and drop or click to browse
              </p>
            </div>
            <div className="space-y-1 text-xs text-gray-500">
              <p>Recommended aspect ratio: {aspectRatio}</p>
              <p>Maximum file size: {maxSizeMB}MB</p>
              <p>Supported formats: JPG, PNG, WebP</p>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
