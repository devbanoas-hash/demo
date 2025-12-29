import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CEODashboard from "./pages/CEODashboard";
import TacticalDashboard from "./pages/TacticalDashboard";
import ClinicDashboard from "./pages/ClinicDashboard";
import CustomerHub from "./pages/CustomerHub";
import DoctorHub from "./pages/DoctorHub";
import MaterialHub from "./pages/MaterialHub";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/ceo" element={<CEODashboard />} />
          <Route path="/phong-ban" element={<TacticalDashboard />} />
          <Route path="/phong-kham" element={<ClinicDashboard />} />
          <Route path="/customer-hub" element={<CustomerHub />} />
          <Route path="/doctor-hub" element={<DoctorHub />} />
          <Route path="/material-hub" element={<MaterialHub />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
