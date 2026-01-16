import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppDataProvider } from "@/contexts/AppDataContext";
import { HeaderProvider } from "@/contexts/HeaderContext";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Production from "./pages/Production";
import Delivery from "./pages/Delivery";
import Products from "./pages/Products";
import Shippers from "./pages/Shippers";
import Users from "./pages/Users";
import Customers from "./pages/Customers";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import { useAuthStore } from "@/store/authStore";
import Developing from "./pages/Developing";

const queryClient = new QueryClient();

// Component to initialize auth on app load
function AppRoutes() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth state from storage on app load
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Orders />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/production"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Production />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/delivery"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Delivery />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Developing />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/shippers"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Developing />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Developing />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Developing />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppDataProvider>
          <HeaderProvider>
            <AppRoutes />
          </HeaderProvider>
        </AppDataProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;