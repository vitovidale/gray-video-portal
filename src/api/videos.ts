
// src/api/videos.ts

import { getToken, removeToken } from './auth'; // Import auth functions for token management

interface Video {
  id: string;
  original_filename: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  created_at: string;
  updated_at: string;
}

export const uploadVideo = async (file: File, onUnauthorized: () => void): Promise<{ success: boolean; message?: string }> => {
  const token = getToken();
  if (!token) {
    onUnauthorized();
    return { success: false, message: 'Token não encontrado. Faça login novamente.' };
  }

  const formData = new FormData();
  formData.append('video', file); // Matches Go backend's c.FormFile("video")

  try {
    const response = await fetch('/upload', { // Relative path handled by Nginx
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, message: 'Upload realizado com sucesso!' };
    } else {
      if (response.status === 401) {
        removeToken();
        onUnauthorized();
        return { success: false, message: 'Sessão expirada. Faça login novamente.' };
      } else {
        return { success: false, message: data.message || 'Erro no upload' };
      }
    }
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, message: 'Erro de conexão. Verifique se o servidor está rodando.' };
  }
};

export const fetchVideos = async (onUnauthorized: () => void): Promise<{ success: boolean; videos?: Video[]; message?: string }> => {
  const token = getToken();
  if (!token) {
    onUnauthorized();
    return { success: false, message: 'Token não encontrado. Faça login novamente.' };
  }

  try {
    const response = await fetch('/videos/status', { // Relative path handled by Nginx
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const videos: Video[] = await response.json();
      return { success: true, videos };
    } else {
      if (response.status === 401) {
        removeToken();
        onUnauthorized();
        return { success: false, message: 'Sessão expirada. Faça login novamente.' };
      } else {
        return { success: false, message: 'Erro ao carregar vídeos: ' + response.statusText };
      }
    }
  } catch (error) {
    console.error('Error loading videos:', error);
    return { success: false, message: 'Erro de conexão. Verifique se o servidor está rodando.' };
  }
};

export const downloadVideo = async (videoId: string, onUnauthorized: () => void): Promise<{ success: boolean; message?: string }> => {
  const token = getToken();
  if (!token) {
    onUnauthorized();
    return { success: false, message: 'Token não encontrado. Faça login novamente.' };
  }

  try {
    const response = await fetch(`/videos/${videoId}/download`, { // Relative path handled by Nginx
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `video_${videoId}.zip`; // You might want to get the original filename from the response headers or API
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return { success: true };
    } else {
      if (response.status === 401) {
        removeToken();
        onUnauthorized();
        return { success: false, message: 'Sessão expirada. Faça login novamente.' };
      } else {
        return { success: false, message: 'Erro ao fazer download do vídeo: ' + response.statusText };
      }
    }
  } catch (error) {
    console.error('Download error:', error);
    return { success: false, message: 'Erro de conexão ao tentar baixar vídeo: ' + (error as Error).message };
  }
};
