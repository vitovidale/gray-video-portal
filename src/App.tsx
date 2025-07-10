
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from "react"; // Import React hooks
import { toast } from "@/hooks/use-toast"; // Import toast for messages

// Import API services
import { getToken, removeToken } from "./api/auth";

// Import components (we'll create these soon)
import AuthPage from "./pages/AuthPage";
import UploadPage from "./pages/UploadPage";
import VideosPage from "./pages/VideosPage";
import NotFound from "./pages/NotFound"; // Keep NotFound
import Navbar from "./components/layout/Navbar"; // New Navbar component

const queryClient = new QueryClient();

// A simple LoadingSpinner component to replace the inline spinner
// You can move this to a separate file like src/components/common/LoadingSpinner.tsx later
const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
    <div className="text-center">
      <div className="loading-spinner mx-auto mb-4"></div> {/* This will need custom CSS */}
      <p className="text-gray-600">Carregando...</p>
    </div>
  </div>
);

// Add custom CSS for loading-spinner and animations (from original index.html)
// You might want to move these to a separate CSS file or utility classes.
// For now, ensure they are in src/index.css or src/App.css
/*
.loading-spinner {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #6b7280;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.slide-in {
  animation: slideIn 0.4s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}
*/


const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<'auth' | 'upload' | 'videos'>('auth');
  const [isLoading, setIsLoading] = useState<boolean>(true); // State for initial loading screen

  // Function to handle unauthorized access from API calls
  const handleUnauthorized = () => {
    removeToken();
    setIsLoggedIn(false);
    setCurrentPage('auth');
    toast({
      title: "Sessão expirada",
      description: "Por favor, faça login novamente.",
      variant: "destructive",
    });
  };

  useEffect(() => {
    // Simulate initial loading delay and check token
    const checkAuth = async () => {
      // Small delay for loading screen effect
      await new Promise(resolve => setTimeout(resolve, 1000));

      const token = getToken();
      if (token) {
        setIsLoggedIn(true);
        setCurrentPage('upload'); // Default to upload page after login
      } else {
        setIsLoggedIn(false);
        setCurrentPage('auth');
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []); // Run once on component mount

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setCurrentPage('upload');
    toast({
      title: "Login realizado com sucesso!",
      variant: "default",
    });
  };

  const handleLogout = () => {
    removeToken();
    setIsLoggedIn(false);
    setCurrentPage('auth');
    toast({
      title: "Logout realizado com sucesso!",
      variant: "default",
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {isLoggedIn && (
            <Navbar
              onUploadClick={() => setCurrentPage('upload')}
              onVideosClick={() => setCurrentPage('videos')}
              onLogout={handleLogout}
            />
          )}
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {currentPage === 'auth' && !isLoggedIn && (
              <AuthPage onLoginSuccess={handleLoginSuccess} />
            )}
            {currentPage === 'upload' && isLoggedIn && (
              <UploadPage onUnauthorized={handleUnauthorized} onUploadSuccess={() => setCurrentPage('videos')} />
            )}
            {currentPage === 'videos' && isLoggedIn && (
              <VideosPage onUnauthorized={handleUnauthorized} onUploadClick={() => setCurrentPage('upload')} />
            )}
            {/* The NotFound route from the original App.tsx */}
            {/* Note: This example uses currentPage state for navigation within the main content area.
                If you plan to use react-router-dom for all page navigation, this logic will change.
                For now, let's keep it simple to mirror the original index.html behavior. */}
            <Routes>
              {/* This route will handle direct URL access for other paths if needed, but not the main app flow yet */}
              <Route path="/" element={<></>} /> {/* Placeholder for root if not handled by currentPage */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
