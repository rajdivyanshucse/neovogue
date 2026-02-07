import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/hooks/useTheme";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import Designers from "./pages/Designers";
import DesignerProfile from "./pages/DesignerProfile";

// Customer Routes
import CustomerDashboard from "./pages/customer/Dashboard";
import NewRequest from "./pages/customer/NewRequest";
import Orders from "./pages/customer/Orders";
import Impact from "./pages/customer/Impact";
import CustomerMessages from "./pages/customer/Messages";
import CustomerSettings from "./pages/customer/Settings";

// Designer Routes
import DesignerDashboard from "./pages/designer/Dashboard";
import Portfolio from "./pages/designer/Portfolio";
import Requests from "./pages/designer/Requests";
import RequestDetail from "./pages/designer/RequestDetail";
import Quotations from "./pages/designer/Quotations";
import Earnings from "./pages/designer/Earnings";
import DesignerMessages from "./pages/designer/Messages";
import DesignerSettings from "./pages/designer/Settings";

// Delivery Partner Routes
import DeliveryDashboard from "./pages/delivery/Dashboard";
import Assignments from "./pages/delivery/Assignments";
import ActiveDeliveries from "./pages/delivery/Active";
import DeliveryHistory from "./pages/delivery/History";
import DeliverySettings from "./pages/delivery/Settings";

// Admin Routes
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminOrders from "./pages/admin/Orders";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminDisputes from "./pages/admin/Disputes";
import AdminSettings from "./pages/admin/Settings";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename="/neovogue">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/designers" element={<Designers />} />
              <Route path="/designers/:id" element={<DesignerProfile />} />
              
              {/* Customer Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/new-request" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <NewRequest />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/orders" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <Orders />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/orders/:id" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <Orders />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/impact" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <Impact />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/messages" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerMessages />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/settings" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerSettings />
                </ProtectedRoute>
              } />
              
              {/* Designer Routes */}
              <Route path="/designer" element={
                <ProtectedRoute allowedRoles={['designer']}>
                  <DesignerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/designer/portfolio" element={
                <ProtectedRoute allowedRoles={['designer']}>
                  <Portfolio />
                </ProtectedRoute>
              } />
              <Route path="/designer/requests" element={
                <ProtectedRoute allowedRoles={['designer']}>
                  <Requests />
                </ProtectedRoute>
              } />
              <Route path="/designer/requests/:id" element={
                <ProtectedRoute allowedRoles={['designer']}>
                  <RequestDetail />
                </ProtectedRoute>
              } />
              <Route path="/designer/quotations" element={
                <ProtectedRoute allowedRoles={['designer']}>
                  <Quotations />
                </ProtectedRoute>
              } />
              <Route path="/designer/earnings" element={
                <ProtectedRoute allowedRoles={['designer']}>
                  <Earnings />
                </ProtectedRoute>
              } />
              <Route path="/designer/messages" element={
                <ProtectedRoute allowedRoles={['designer']}>
                  <DesignerMessages />
                </ProtectedRoute>
              } />
              <Route path="/designer/settings" element={
                <ProtectedRoute allowedRoles={['designer']}>
                  <DesignerSettings />
                </ProtectedRoute>
              } />
              
              {/* Delivery Partner Routes */}
              <Route path="/delivery" element={
                <ProtectedRoute allowedRoles={['delivery_partner']}>
                  <DeliveryDashboard />
                </ProtectedRoute>
              } />
              <Route path="/delivery/assignments" element={
                <ProtectedRoute allowedRoles={['delivery_partner']}>
                  <Assignments />
                </ProtectedRoute>
              } />
              <Route path="/delivery/active" element={
                <ProtectedRoute allowedRoles={['delivery_partner']}>
                  <ActiveDeliveries />
                </ProtectedRoute>
              } />
              <Route path="/delivery/history" element={
                <ProtectedRoute allowedRoles={['delivery_partner']}>
                  <DeliveryHistory />
                </ProtectedRoute>
              } />
              <Route path="/delivery/settings" element={
                <ProtectedRoute allowedRoles={['delivery_partner']}>
                  <DeliverySettings />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              } />
              <Route path="/admin/orders" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminOrders />
                </ProtectedRoute>
              } />
              <Route path="/admin/analytics" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAnalytics />
                </ProtectedRoute>
              } />
              <Route path="/admin/disputes" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDisputes />
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminSettings />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
