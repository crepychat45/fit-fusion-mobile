
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Upload, 
  X, 
  Image, 
  Video, 
  FileText, 
  Music,
  File,
  Camera
} from 'lucide-react';

interface MediaFile {
  id: string;
  file: File;
  type: 'image' | 'video' | 'audio' | 'document';
  preview?: string;
  size: string;
}

interface MediaUploadProps {
  onFilesSelected: (files: MediaFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
}

export function MediaUpload({ onFilesSelected, maxFiles = 5, maxFileSize = 10 }: MediaUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const allowedTypes = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/webm', 'video/mov'],
    audio: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'],
    document: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  };

  const getFileType = (mimeType: string): 'image' | 'video' | 'audio' | 'document' => {
    if (allowedTypes.image.includes(mimeType)) return 'image';
    if (allowedTypes.video.includes(mimeType)) return 'video';
    if (allowedTypes.audio.includes(mimeType)) return 'audio';
    return 'document';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `File "${file.name}" exceeds ${maxFileSize}MB limit`,
        variant: "destructive"
      });
      return false;
    }

    // Check file type
    const allAllowedTypes = Object.values(allowedTypes).flat();
    if (!allAllowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: `File "${file.name}" is not a supported format`,
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const processFiles = async (files: FileList) => {
    const validFiles: MediaFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (selectedFiles.length + validFiles.length >= maxFiles) {
        toast({
          title: "Too many files",
          description: `Maximum ${maxFiles} files allowed`,
          variant: "destructive"
        });
        break;
      }

      if (!validateFile(file)) continue;

      const mediaFile: MediaFile = {
        id: `${Date.now()}-${i}`,
        file,
        type: getFileType(file.type),
        size: formatFileSize(file.size)
      };

      // Create preview for images
      if (mediaFile.type === 'image') {
        mediaFile.preview = URL.createObjectURL(file);
      }

      validFiles.push(mediaFile);
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const removeFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== id));
  };

  const handleSend = () => {
    if (selectedFiles.length === 0) return;
    
    onFilesSelected(selectedFiles);
    setSelectedFiles([]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Music className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging 
            ? 'border-primary bg-primary/10' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
      >
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-2">
          Drag and drop files here, or click to select
        </p>
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="mb-2"
        >
          <Camera className="h-4 w-4 mr-2" />
          Choose Files
        </Button>
        <p className="text-xs text-muted-foreground">
          Supports images, videos, audio, and documents (max {maxFileSize}MB each)
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInput}
        accept="image/*,video/*,audio/*,.pdf,.txt,.doc,.docx"
      />

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Selected Files ({selectedFiles.length})</h4>
            <Button variant="outline" size="sm" onClick={handleSend}>
              Send Files
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
            {selectedFiles.map((file) => (
              <Card key={file.id} className="p-3">
                <div className="flex items-center gap-3">
                  {file.preview ? (
                    <img 
                      src={file.preview} 
                      alt={file.file.name}
                      className="h-10 w-10 object-cover rounded"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                      {getFileIcon(file.type)}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.file.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {file.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{file.size}</span>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file.id)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
