import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { RotateCw, ZoomIn, Check, Sun, Contrast, Droplet } from 'lucide-react';
import getCroppedImg from '../utils/canvasUtils';

interface ImageCropperProps {
  imageSrc: string;
  mimeType: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
}

const ASPECT_RATIOS = [
  { label: 'Livre', value: undefined },
  { label: '1:1', value: 1 / 1 },
  { label: '16:9', value: 16 / 9 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:2', value: 3 / 2 },
  { label: '9:16', value: 9 / 16 },
];

const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, mimeType, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  
  // New state for filters
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      const croppedImage = await getCroppedImg(
        imageSrc, 
        croppedAreaPixels, 
        rotation, 
        { horizontal: false, vertical: false },
        { brightness, contrast, saturation },
        mimeType
      );
      if (croppedImage) {
        onCropComplete(croppedImage);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filterStyle = {
    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
      <div className="relative h-[400px] md:h-[500px] w-full bg-gray-900">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspect}
          onCropChange={onCropChange}
          onCropComplete={onCropCompleteHandler}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          style={{ mediaStyle: filterStyle }}
        />
      </div>

      <div className="p-6 space-y-6">
        {/* Aspect Ratio Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Proporção (Aspect Ratio)</label>
          <div className="flex flex-wrap gap-2">
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio.label}
                onClick={() => setAspect(ratio.value)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  aspect === ratio.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {ratio.label}
              </button>
            ))}
          </div>
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Transform Controls */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 border-b pb-1">Transformar</h3>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <ZoomIn className="w-4 h-4" /> Zoom
                </label>
                <span className="text-xs text-gray-500">{zoom.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <RotateCw className="w-4 h-4" /> Rotação
                </label>
                <span className="text-xs text-gray-500">{rotation}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

          {/* Color Adjustments */}
          <div className="space-y-4 md:col-span-1 lg:col-span-2">
            <h3 className="text-sm font-semibold text-gray-900 border-b pb-1">Ajustes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Sun className="w-4 h-4" /> Brilho
                  </label>
                  <span className="text-xs text-gray-500">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={200}
                  step={1}
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Contrast className="w-4 h-4" /> Contraste
                  </label>
                  <span className="text-xs text-gray-500">{contrast}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={200}
                  step={1}
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Droplet className="w-4 h-4" /> Saturação
                  </label>
                  <span className="text-xs text-gray-500">{saturation}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={200}
                  step={1}
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center gap-2"
          >
            <Check className="w-4 h-4" /> Aplicar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
