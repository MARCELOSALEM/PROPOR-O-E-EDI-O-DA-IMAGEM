import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (imageUrl: string, file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      onImageSelected(reader.result as string, file);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        <Upload className="w-10 h-10 mb-3 text-gray-400" />
        <p className="mb-2 text-sm text-gray-500">
          <span className="font-semibold">Clique para enviar</span> ou arraste e solte
        </p>
        <p className="text-xs text-gray-500">SVG, PNG, JPG ou GIF</p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImageUploader;
