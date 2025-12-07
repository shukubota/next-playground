import { useState, useRef, useCallback } from 'react';

interface FileUploadProps {
  id: string;
  name: string;
  accept: string;
  multiple?: boolean;
  required?: boolean;
  label: string;
  description?: string;
  onFileChange: (files: FileList | null) => void;
  className?: string;
}

interface PreviewFile {
  file: File;
  url: string;
  id: string;
}

export default function FileUpload({
  id,
  name,
  accept,
  multiple = false,
  required = false,
  label,
  description,
  onFileChange,
  className = ''
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previews, setPreviews] = useState<PreviewFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isImageFile = (file: File) => {
    return file.type.startsWith('image/');
  };

  const createFilePreview = (file: File): PreviewFile => {
    const url = isImageFile(file) ? URL.createObjectURL(file) : '';
    return {
      file,
      url,
      id: `${file.name}-${Date.now()}`
    };
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    const newPreviews: PreviewFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      newPreviews.push(createFilePreview(file));
    }

    if (multiple) {
      setPreviews(prev => [...prev, ...newPreviews]);
    } else {
      // Clean up previous preview URLs
      previews.forEach(preview => {
        if (preview.url) URL.revokeObjectURL(preview.url);
      });
      setPreviews(newPreviews);
    }

    onFileChange(files);
  }, [multiple, onFileChange, previews]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const removeFile = (previewId: string) => {
    const updatedPreviews = previews.filter(preview => {
      if (preview.id === previewId) {
        if (preview.url) URL.revokeObjectURL(preview.url);
        return false;
      }
      return true;
    });
    
    setPreviews(updatedPreviews);
    
    // Update file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Create new FileList with remaining files
    const remainingFiles = updatedPreviews.map(p => p.file);
    const dt = new DataTransfer();
    remainingFiles.forEach(file => dt.items.add(file));
    onFileChange(dt.files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium" style={{color: '#3d3939'}}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {description && (
        <p className="text-sm" style={{color: '#aaabab'}}>{description}</p>
      )}

      {/* Upload Area */}
      <div
        className="relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200"
        style={{
          borderColor: dragActive ? '#00a9e0' : '#aaabab',
          backgroundColor: dragActive ? '#d1eaf8' : 'transparent'
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          id={id}
          name={name}
          accept={accept}
          multiple={multiple}
          required={required}
          onChange={(e) => handleFiles(e.target.files)}
          className="sr-only"
        />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <svg
              className="w-12 h-12"
              style={{color: '#aaabab'}}
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-white px-4 py-2 rounded-lg transition duration-200"
              style={{backgroundColor: '#00a9e0'}}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#155fad'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#00a9e0'}
            >
              ファイルを選択
            </button>
            <p className="mt-2 text-sm" style={{color: '#aaabab'}}>
              またはファイルをここにドラッグ&ドロップ
            </p>
          </div>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="w-32 rounded-full h-2 mb-2" style={{backgroundColor: '#efefef'}}>
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%`, backgroundColor: '#00a9e0' }}
                ></div>
              </div>
              <p className="text-sm" style={{color: '#3d3939'}}>アップロード中... {uploadProgress}%</p>
            </div>
          </div>
        )}
      </div>

      {/* File Previews */}
      {previews.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium" style={{color: '#3d3939'}}>選択されたファイル:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {previews.map((preview) => (
              <div
                key={preview.id}
                className="relative bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeFile(preview.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Image Preview */}
                {isImageFile(preview.file) && preview.url && (
                  <div className="mb-3">
                    <img
                      src={preview.url}
                      alt={preview.file.name}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                )}

                {/* File Info */}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {preview.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(preview.file.size)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {preview.file.type || 'Unknown type'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}