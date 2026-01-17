import { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Check,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { Button } from './Button';

/**
 * Enhanced Image Upload Component with:
 * - Drag & Drop support
 * - Image preview
 * - Basic crop/zoom/rotate controls
 * - Upload progress
 * - Multiple file support
 */
export function ImageUpload({
  onUpload,
  maxFiles = 1,
  maxSize = 5,
  accept = 'image/*',
  showPreview = true,
  showCropControls = true,
  className = '',
  uploadText = 'Click to upload or drag and drop',
  helperText = 'PNG, JPG up to',
}) {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const fileInputRef = useRef(null);

  // Image manipulation state
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const validateFile = (file) => {
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'Only image files are allowed' };
    }
    if (file.size > maxSize * 1024 * 1024) {
      return { valid: false, error: `File size exceeds ${maxSize}MB` };
    }
    return { valid: true };
  };

  const processFile = (file) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      return { ...validation, file: null };
    }

    return {
      valid: true,
      file: {
        id: Date.now() + Math.random(),
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        progress: 0,
        status: 'ready', // ready, uploading, success, error
        zoom: 1,
        rotation: 0,
      }
    };
  };

  const handleFiles = useCallback((newFiles) => {
    const filesArray = Array.from(newFiles);
    const remainingSlots = maxFiles - files.length;
    
    if (remainingSlots <= 0) {
      return;
    }

    const filesToAdd = filesArray.slice(0, remainingSlots);
    const processedFiles = filesToAdd
      .map(processFile)
      .filter(result => result.valid)
      .map(result => result.file);

    setFiles(prev => [...prev, ...processedFiles]);
    
    // Notify parent
    if (onUpload && processedFiles.length > 0) {
      processedFiles.forEach(file => {
        onUpload(file);
      });
    }
  }, [files, maxFiles, onUpload]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    handleFiles(droppedFiles);
  }, [handleFiles]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
    // Reset input
    e.target.value = '';
  };

  const removeFile = (id) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== id);
      // Revoke object URL to free memory
      const removed = prev.find(f => f.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return updated;
    });
    if (selectedIndex !== null && files[selectedIndex]?.id === id) {
      setSelectedIndex(null);
    }
  };

  const updateFileProgress = (id, progress, status = 'uploading') => {
    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, progress, status } : f
    ));
  };

  const updateFileTransform = (id, updates) => {
    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, ...updates } : f
    ));
  };

  const selectedFile = selectedIndex !== null ? files[selectedIndex] : null;

  return (
    <div className={className}>
      {/* Upload Area */}
      {files.length < maxFiles && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-[1.02]'
              : 'border-cream-300 dark:border-earth-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={maxFiles > 1}
            onChange={handleFileInput}
            className="hidden"
          />
          
          <Upload className="w-12 h-12 mx-auto text-earth-400 mb-2" />
          <p className="font-medium text-earth-700 dark:text-earth-300">
            {uploadText}
          </p>
          <p className="text-sm text-earth-500 dark:text-earth-400 mt-1">
            {helperText} {maxSize}MB
          </p>
          {maxFiles > 1 && (
            <p className="text-xs text-earth-400 dark:text-earth-500 mt-2">
              {files.length}/{maxFiles} files selected
            </p>
          )}
        </div>
      )}

      {/* File List/Grid */}
      {showPreview && files.length > 0 && (
        <div className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {files.map((file, index) => (
              <div
                key={file.id}
                className={`relative group rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  selectedIndex === index
                    ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800'
                    : 'border-cream-200 dark:border-earth-700 hover:border-primary-300'
                }`}
                onClick={() => setSelectedIndex(index)}
              >
                {/* Image Preview */}
                <div className="aspect-square bg-cream-100 dark:bg-earth-800 flex items-center justify-center overflow-hidden">
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-full h-full object-cover transition-transform"
                    style={{
                      transform: `scale(${file.zoom || 1}) rotate(${file.rotation || 0}deg)`,
                    }}
                  />
                </div>

                {/* Progress Overlay */}
                {file.status === 'uploading' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-white mx-auto mb-2" />
                      <p className="text-white text-sm font-medium">{file.progress}%</p>
                    </div>
                  </div>
                )}

                {/* Success Overlay */}
                {file.status === 'success' && (
                  <div className="absolute inset-0 bg-leaf-500/80 flex items-center justify-center">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                )}

                {/* Error Overlay */}
                {file.status === 'error' && (
                  <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center">
                    <X className="w-8 h-8 text-white" />
                  </div>
                )}

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* File Name */}
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-2">
                  <p className="text-white text-xs truncate">{file.name}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Image Editor Controls */}
          {showCropControls && selectedFile && selectedFile.status === 'ready' && (
            <div className="mt-4 p-4 bg-cream-50 dark:bg-earth-800 rounded-xl">
              <p className="text-sm font-medium text-earth-700 dark:text-earth-300 mb-3">
                Edit Image
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Zoom Controls */}
                <div className="flex items-center gap-1 px-3 py-2 bg-white dark:bg-earth-700 rounded-lg">
                  <button
                    type="button"
                    onClick={() => {
                      const newZoom = Math.max(0.5, (selectedFile.zoom || 1) - 0.1);
                      updateFileTransform(selectedFile.id, { zoom: newZoom });
                    }}
                    className="p-1 hover:bg-cream-100 dark:hover:bg-earth-600 rounded transition-colors"
                  >
                    <ZoomOut className="w-4 h-4 text-earth-600 dark:text-earth-300" />
                  </button>
                  <span className="text-sm text-earth-600 dark:text-earth-300 min-w-12 text-center">
                    {Math.round((selectedFile.zoom || 1) * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const newZoom = Math.min(3, (selectedFile.zoom || 1) + 0.1);
                      updateFileTransform(selectedFile.id, { zoom: newZoom });
                    }}
                    className="p-1 hover:bg-cream-100 dark:hover:bg-earth-600 rounded transition-colors"
                  >
                    <ZoomIn className="w-4 h-4 text-earth-600 dark:text-earth-300" />
                  </button>
                </div>

                {/* Rotate Button */}
                <button
                  type="button"
                  onClick={() => {
                    const newRotation = ((selectedFile.rotation || 0) + 90) % 360;
                    updateFileTransform(selectedFile.id, { rotation: newRotation });
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-earth-700 rounded-lg hover:bg-cream-100 dark:hover:bg-earth-600 transition-colors"
                >
                  <RotateCw className="w-4 h-4 text-earth-600 dark:text-earth-300" />
                  <span className="text-sm text-earth-600 dark:text-earth-300">Rotate</span>
                </button>

                {/* Reset Button */}
                <button
                  type="button"
                  onClick={() => {
                    updateFileTransform(selectedFile.id, { zoom: 1, rotation: 0 });
                  }}
                  className="px-3 py-2 text-sm text-earth-600 dark:text-earth-300 hover:text-earth-900 dark:hover:text-cream-100 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {files.length === 0 && showPreview && (
        <div className="mt-4 text-center py-8 text-earth-400 dark:text-earth-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-2" />
          <p className="text-sm">No images selected</p>
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
