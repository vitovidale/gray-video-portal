// src/pages/VideosPage.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { fetchVideos, downloadVideo } from '@/api/videos';

// Define a type for your video data to ensure type safety
interface Video {
  id: string;
  original_filename: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  created_at: string;
  updated_at: string;
}

interface VideosPageProps {
  onUnauthorized: () => void;
  onUploadClick: () => void;
}

const VideosPage: React.FC<VideosPageProps> = ({ onUnauthorized, onUploadClick }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // To show spinner on refresh button

  // Utility functions (moved from index.html)
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusBadge = (status: Video['status']): JSX.Element => {
    const statusConfig = {
      'PENDING': { class: 'bg-yellow-100 text-yellow-800', text: 'Pendente' },
      'PROCESSING': { class: 'bg-blue-100 text-blue-800', text: 'Processando' },
      'COMPLETED': { class: 'bg-green-100 text-green-800', text: 'Concluído' },
      'FAILED': { class: 'bg-red-100 text-red-800', text: 'Falhou' }
    };

    const config = statusConfig[status] || { class: 'bg-gray-100 text-gray-800', text: status };
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}`}>{config.text}</span>;
  };

  const loadVideos = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setIsLoading(true);
    else setIsRefreshing(true);

    const result = await fetchVideos(onUnauthorized);

    if (result.success && result.videos) {
      setVideos(result.videos);
    } else {
      toast({
        title: "Erro ao carregar vídeos",
        description: result.message,
        variant: "destructive",
      });
      setVideos([]); // Clear videos on error
    }
    setIsLoading(false);
    setIsRefreshing(false);
  };

  const handleDownload = async (videoId: string) => {
    toast({
      title: "Iniciando download...",
      description: "Seu download será iniciado em breve.",
      variant: "default",
    });
    const result = await downloadVideo(videoId, onUnauthorized);
    if (!result.success) {
      toast({
        title: "Erro no download",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  // Effect for initial load and auto-refresh
  useEffect(() => {
    loadVideos(); // Initial load

    const refreshInterval = setInterval(() => {
      // Only refresh if component is active (e.g., current page is videos)
      // The App.tsx now handles current page, so this component will only be mounted if currentPage === 'videos'
      loadVideos(false); // Don't show full loading spinner on auto-refresh
    }, 10000); // Refresh every 10 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [onUnauthorized]); // Dependency on onUnauthorized to re-setup if auth state changes

  return (
    <div className="max-w-full mx-auto">
      <Card className="rounded-xl shadow-lg">
        <CardHeader className="px-6 py-4 border-b border-gray-200 flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold text-gray-900">Meus Vídeos</CardTitle>
          <Button onClick={() => loadVideos(false)} disabled={isRefreshing}>
            {isRefreshing ? (
              <span className="loading-spinner mr-2"></span>
            ) : (
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            )}
            <span>Atualizar</span>
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando vídeos...</p>
              {/* Optional: Add skeleton loaders for table rows */}
              <div className="space-y-3 mt-4">
                <Skeleton className="h-[20px] w-full" />
                <Skeleton className="h-[20px] w-full" />
                <Skeleton className="h-[20px] w-full" />
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {videos.length > 0 ? (
                <Table className="min-w-full divide-y divide-gray-200">
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</TableHead>
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arquivo</TableHead>
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableHead>
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload</TableHead>
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Atualização</TableHead>
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white divide-y divide-gray-200">
                    {videos.map(video => (
                      <TableRow key={video.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{video.id}</TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">{video.original_filename || 'N/A'}</div>
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap">{getStatusBadge(video.status)}</TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(video.created_at)}</TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(video.updated_at)}</TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {video.status === 'COMPLETED' ? (
                            <Button onClick={() => handleDownload(video.id)}>
                              Download
                            </Button>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <p className="text-gray-500 mb-4">Nenhum vídeo encontrado</p>
                  <Button onClick={onUploadClick}>
                    Fazer primeiro upload
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
      </Card>
    </div>
  );
};

export default VideosPage;