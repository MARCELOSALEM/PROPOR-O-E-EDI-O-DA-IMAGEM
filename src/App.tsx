/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Upload, Download, RefreshCw, Scissors, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ImageUploader from './components/ImageUploader';
import ImageCropper from './components/ImageCropper';

function App() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelected = (imageUrl: string, file: File) => {
    setImageSrc(imageUrl);
    setOriginalFile(file);
    setIsCropping(true);
    setCroppedImage(null);
  };

  const handleCropComplete = (croppedImg: string) => {
    setCroppedImage(croppedImg);
    setIsCropping(false);
  };

  const handleCancelCrop = () => {
    setIsCropping(false);
    if (!croppedImage) {
      setImageSrc(null);
      setOriginalFile(null);
    }
  };

  const handleDownload = () => {
    if (croppedImage && originalFile) {
      const link = document.createElement('a');
      link.href = croppedImage;
      // Preserve original filename but add -cropped suffix
      const nameParts = originalFile.name.split('.');
      const extension = nameParts.pop();
      const newName = `${nameParts.join('.')}-cropped.${extension}`;
      link.download = newName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReset = () => {
    setImageSrc(null);
    setOriginalFile(null);
    setCroppedImage(null);
    setIsCropping(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Redimensionador de Imagens</h1>
          </div>
          <div className="text-sm text-gray-500 hidden sm:block">
            Corte de imagem simples, rápido e seguro
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-5xl">
        <AnimatePresence mode="wait">
          {!imageSrc ? (
            // Upload State
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center min-h-[60vh] space-y-8"
            >
              <div className="text-center space-y-4 max-w-2xl">
                <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl tracking-tight">
                  Redimensione e Corte suas Imagens
                </h2>
                <p className="text-lg text-gray-600">
                  Faça o upload de uma imagem para começar. Escolha entre proporções padrão ou crie um corte personalizado.
                </p>
              </div>
              
              <div className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <ImageUploader onImageSelected={handleImageSelected} />
                
                <div className="mt-6 grid grid-cols-3 gap-4 text-center text-sm text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-2 bg-indigo-50 rounded-full text-indigo-600">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <span>Alta Qualidade</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-2 bg-indigo-50 rounded-full text-indigo-600">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <span>Prévia Instantânea</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-2 bg-indigo-50 rounded-full text-indigo-600">
                      <Download className="w-5 h-5" />
                    </div>
                    <span>Download Fácil</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : isCropping ? (
            // Cropping State
            <motion.div
              key="cropping"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex flex-col">
                  <h2 className="text-2xl font-bold text-gray-900">Ajustar Corte</h2>
                  {originalFile && (
                    <span className="text-xs text-gray-500 truncate max-w-[200px]">
                      Arquivo: {originalFile.name}
                    </span>
                  )}
                </div>
                <button 
                  onClick={handleCancelCrop}
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Cancelar
                </button>
              </div>
              <ImageCropper
                imageSrc={imageSrc}
                mimeType={originalFile?.type || 'image/jpeg'}
                onCropComplete={handleCropComplete}
                onCancel={handleCancelCrop}
              />
            </motion.div>
          ) : (
            // Result State
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <div className="flex flex-col">
                    <h2 className="text-xl font-semibold text-gray-900">Sua Imagem Cortada</h2>
                    {originalFile && (
                      <span className="text-xs text-gray-500">
                        Original: {originalFile.name}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsCropping(true)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Scissors className="w-4 h-4" /> Editar Corte
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" /> Recomeçar
                    </button>
                  </div>
                </div>
                
                <div className="p-8 bg-gray-100 flex justify-center items-center min-h-[400px]">
                  {croppedImage && (
                    <img
                      src={croppedImage}
                      alt="Resultado do corte"
                      className="max-w-full max-h-[60vh] rounded-lg shadow-lg object-contain"
                    />
                  )}
                </div>

                <div className="p-6 bg-white border-t border-gray-100 flex justify-center">
                  <button
                    onClick={handleDownload}
                    className="w-full sm:w-auto px-8 py-3 text-base font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" /> Baixar Imagem
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Redimensionador de Imagens. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

