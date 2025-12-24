import './App.css'
import './index.css'
import { Routes, Route, useLocation } from 'react-router-dom';
import { Topbar } from './components/NavBar'
import { AppSidebar } from './components/AppSidebar'
import { SidebarProvider } from './components/ui/sidebar'
import { SignIn } from './components/Signin'
import React, { useState, useEffect } from 'react'

import { Dashboard } from './components/Dashboard'
import Agent from './components/Agent';
import CallAgent from './components/CallAgent';
import Conversation from './components/Conversation';
import Billing from './components/billing/Billing';
import Settings from './components/setting/Settings';
import Domain from './components/domain/Domain';
import ChatbotPage from './components/ChatbotPage';
import VoiceBotPage from './components/VoiceBotPage';
import ChatbotEmbed from './components/domain/chat/ChatbotEmbed';
import Landing from './Landing';
import Workflow from "./components/workflow/workflow";
import CreateWorkflow from './components/workflow/createWorkflow';

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Left Sidebar */}
        <AppSidebar />

        {/* Right Panel */}
        <div className="flex flex-col flex-1">
          {/* Top Navigation */}
          {/* <Topbar /> */}

          {/* Main Content Area */}
          <div className="flex-1 pr-3 pt-4 pl-3 bg-gray-50">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AppContent() {
  const [signedIn, setSignedIn] = useState(false);
  const location = useLocation();

  // Auto-login if token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setSignedIn(true);
    }
  }, []);

  // Public chatbot and voice bot routes - no authentication required
  if (location.pathname === "/chatbot") {
    return <ChatbotPage />;
  }
  if (location.pathname === "/voice-bot") {
    return <VoiceBotPage />;
  }

  // All other routes require authentication
  if (!signedIn) {
    return <SignIn onSuccess={() => setSignedIn(true)} />;
  }

  return (
    <Routes>
      {/* Public routes that don't need layout */}
      <Route path="/widget/chatbot/:domain" element={<ChatbotEmbed />} />
      <Route path="/landing" element={<Landing />} />
      
      {/* Authenticated routes with layout */}
      <Route
        path="/"
        element={
          <AuthenticatedLayout>
            {localStorage.getItem("token") ? (
              <Dashboard />
            ) : (
              <SignIn onSuccess={() => setSignedIn(true)} />
            )}
          </AuthenticatedLayout>
        }
      />
      <Route
        path="/agents"
        element={
          <AuthenticatedLayout>
            <Agent />
          </AuthenticatedLayout>
        }
      />
      <Route
        path="/call-agent/:agentId"
        element={
          <AuthenticatedLayout>
            <CallAgent />
          </AuthenticatedLayout>
        }
      />
      <Route
        path="/call-history"
        element={
          <AuthenticatedLayout>
            <Conversation />
          </AuthenticatedLayout>
        }
      />
      
      <Route 
        path='/workflow' 
        element={
          <AuthenticatedLayout>
            <Workflow />
          </AuthenticatedLayout>
        }
      />

      <Route 
        path='workflow/createWorkflow' 
        element={
          <AuthenticatedLayout>
            <CreateWorkflow />
          </AuthenticatedLayout>
        }
      />

      <Route
        path="/billing"
        element={
          <AuthenticatedLayout>
            <Billing />
          </AuthenticatedLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <AuthenticatedLayout>
            <Settings />
          </AuthenticatedLayout>
        }
      />
      <Route
        path="/domain/:domain"
        element={
          <AuthenticatedLayout>
            <Domain />
          </AuthenticatedLayout>
        }
      />
      {/* <Route
        path="/chatbot/:domain"
        element={
          <AuthenticatedLayout>
            <ChatbotEmbed />
          </AuthenticatedLayout>
        }
      /> */}
      <Route
        path="*"
        element={
          <AuthenticatedLayout>
            <div>Page Not Found</div>
          </AuthenticatedLayout>
        }
      />
    </Routes>
  )
}

function App() {
  return <AppContent />;
}

export default App
