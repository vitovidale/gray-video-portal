// src/pages/UploadPage.tsx

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { uploadVideo } from '@/api/videos';

// Assuming a simple type for an uploading file status
interface UploadingFile {
  file: File;
  id: string; // Unique ID for keying in lists
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  progress: number;
  message?: string;
}

interface UploadPageProps {
  onUnauthorized: () => void;
  onUploadSuccess: () => void;
}

const UploadPage: React.FC<UploadPageProps> = ({ onUnauthorized, onUploadSuccess }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadQueue, setUploadQueue] = useState<UploadingFile[]>([]);
  const [isOverallUploading, setIsOverallUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const generateUniqueId = (): string => {
    return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    let newFiles: File[] = [];
    if ('dataTransfer' in e) { // Handle drop event
      if (e.dataTransfer.files.length > 0) {
        newFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('video/'));
      }
    } else { // Handle change event from input
      if (e.target.files && e.target.files.length > 0) {
        newFiles = Array.from(e.target.files).filter(f => f.type.startsWith('video/'));
      }
    }

    if (newFiles.length > 0) {
      // Filter out files that are already selected to prevent duplicates
      const uniqueNewFiles = newFiles.filter(
        (newFile) => !selectedFiles.some((existingFile) => existingFile.name === newFile.name && existingFile.size === newFile.size)
      );

      setSelectedFiles((prevFiles) => [...prevFiles, ...uniqueNewFiles]);
      toast({
        title: `${uniqueNewFiles.length} arquivo(s) adicionado(s)`,
        description: uniqueNewFiles.map(f => f.name).join(', ') || 'Nenhum arquivo de vídeo válido adicionado.',
        variant: "default",
      });
    }
    // Clear the input value so that selecting the same file again triggers change event
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (fileToRemove: File) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove));
    toast({
      title: `Arquivo '${fileToRemove.name}' removido`,
      variant: "default",
    });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione arquivos de vídeo para upload.",
        variant: "destructive",
      });
      return;
    }

    setIsOverallUploading(true);
    const initialQueue: UploadingFile[] = selectedFiles.map(file => ({
      file,
      id: generateUniqueId(),
      status: 'pending',
      progress: 0,
    }));
    setUploadQueue(initialQueue);
    setSelectedFiles([]); // Clear selected files once they are in the queue

    // Create an array of upload promises
    const uploadPromises = initialQueue.map(async (item) => {
      // Immediately update the item's status to 'uploading' in the UI
      setUploadQueue(prevQueue =>
        prevQueue.map(q => (q.id === item.id ? { ...q, status: 'uploading' } : q))
      );

      try {
        // Start the upload and wait for the result
        const result = await uploadVideo(item.file, onUnauthorized);

        // Handle success or failure for this specific upload
        if (result.success) {
          setUploadQueue(prevQueue =>
            prevQueue.map(q =>
              q.id === item.id ? { ...q, status: 'completed', progress: 100, message: result.message } : q
            )
          );
          toast({
            title: `Upload de '${item.file.name}' concluído!`,
            description: result.message,
            variant: "default",
          });
          return { success: true };
        } else {
          setUploadQueue(prevQueue =>
            prevQueue.map(q =>
              q.id === item.id ? { ...q, status: 'failed', progress: 0, message: result.message } : q
            )
          );
          toast({
            title: `Erro no upload de '${item.file.name}'`,
            description: result.message,
            variant: "destructive",
          });
          return { success: false };
        }
      } catch (error) {
        // Handle unexpected errors during the upload
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        setUploadQueue(prevQueue =>
          prevQueue.map(q => (q.id === item.id ? { ...q, status: 'failed', message } : q))
        );
        return { success: false };
      }
    });

    // Wait for all upload promises to settle (either complete or fail)
    const results = await Promise.allSettled(uploadPromises);

    // Check if all uploads were successful
    const allUploadsSuccessful = results.every(res => res.status === 'fulfilled' && (res.value as any).success);

    setIsOverallUploading(false);

    if (allUploadsSuccessful) {
      onUploadSuccess(); // Only navigate if all uploads succeeded
    }
  };


  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add('border-gray-400');
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('border-gray-400');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('border-gray-400');
    }
    handleFileChange(e);
  };

  const getStatusIndicator = (status: UploadingFile['status']): JSX.Element => {
    switch (status) {
      case 'pending': return <span className="h-2 w-2 rounded-full bg-gray-400"></span>;
      case 'uploading': return <span className="loading-spinner h-4 w-4"></span>; // Reuse CSS for spinner
      case 'completed': return <span className="h-2 w-2 rounded-full bg-green-500"></span>;
      case 'failed': return <span className="h-2 w-2 rounded-full bg-red-500"></span>;
      default: return <></>;
    }
  };


  return (
    <div className="max-w-2xl mx-auto">
      <Card className="rounded-xl shadow-lg p-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900 mb-6">Upload de Vídeos</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={dropZoneRef}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors duration-200"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">Selecione arquivos de vídeo</p>
                <p className="text-gray-500">ou arraste e solte aqui</p>
              </div>
              <input
                type="file"
                id="videoFiles"
                accept="video/*"
                multiple // Allow multiple file selection
                className="hidden"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
              <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={isOverallUploading}>
                Escolher Arquivos
              </Button>
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-6 fade-in">
              <h3 className="text-md font-semibold mb-2">Arquivos selecionados:</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveFile(file)} disabled={isOverallUploading}>
                      <svg className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </Button>
                  </div>
                ))}
              </div>
              <Button onClick={handleUpload} className="w-full mt-4" disabled={isOverallUploading}>
                {isOverallUploading && <span className="loading-spinner mr-2"></span>}
                <span>Fazer Upload dos Arquivos ({selectedFiles.length})</span>
              </Button>
            </div>
          )}

          {uploadQueue.length > 0 && (
            <div className="mt-6 fade-in">
                <h3 className="text-md font-semibold mb-2">Fila de Upload:</h3>
                <div className="space-y-3">
                    {uploadQueue.map(item => (
                        <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                    {getStatusIndicator(item.status)}
                                    <span className="text-sm font-medium text-gray-700">{item.file.name}</span>
                                </div>
                                <span className="text-sm text-gray-500">{item.status === 'uploading' ? 'Enviando...' : item.status === 'completed' ? 'Concluído' : item.status === 'failed' ? 'Falhou' : 'Pendente'}</span>
                            </div>
                            <Progress value={item.progress} className="w-full h-2" />
                            {item.message && item.status === 'failed' && (
                                <p className="text-xs text-red-500 mt-1">{item.message}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
};

export default UploadPage;