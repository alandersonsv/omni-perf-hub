import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SimpleAuthProvider } from "@/contexts/SimpleAuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "@/pages/Login";
import { Register } from "@/pages/Register";
import { ForgotPassword } from "@/pages/ForgotPassword";
import { ResetPassword } from "@/pages/ResetPassword";
import { SetupAgency } from "@/pages/SetupAgency";
import { Debug } from "@/pages/Debug";
import AuthDebug from "@/pages/AuthDebug";
import { SimpleLogin } from "@/pages/SimpleLogin";
import { SimpleDashboard } from "@/pages/SimpleDashboard";
import { Dashboard } from "@/pages/Dashboard";
import { Integrations } from "@/pages/Integrations";
import { OAuthCallback } from "@/pages/OAuthCallback";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import Homepage from "@/pages/Homepage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/setup-agency" element={<SetupAgency />} />
            <Route path="/debug" element={<Debug />} />
            <Route path="/auth-debug" element={<AuthDebug />} />
            <Route path="/simple-login" element={
              <SimpleAuthProvider>
                <SimpleLogin />
              </SimpleAuthProvider>
            } />
            <Route path="/simple-dashboard" element={
              <SimpleAuthProvider>
                <SimpleDashboard />
              </SimpleAuthProvider>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/integrations" element={
              <ProtectedRoute>
                <Integrations />
              </ProtectedRoute>
            } />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
            {/* Documentos Legais - URLs não indexáveis */}
            <Route path="/legal/privacy-policy-2025-confidential" element={<PrivacyPolicy />} />
            <Route path="/legal/terms-of-service-2025-confidential" element={<TermsOfService />} />
            {/* Homepage como página inicial */}
            <Route path="/" element={<Homepage />} />
            {/* Manter rota /homepage para compatibilidade */}
            <Route path="/homepage" element={<Homepage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
