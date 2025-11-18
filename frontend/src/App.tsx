/* eslint-disable @typescript-eslint/no-unused-vars */
import './App.css'
import './index.css'
import { Routes, Route, useLocation } from 'react-router-dom';
import { Topbar } from './components/NavBar'
import { AppSidebar } from './components/AppSidebar'
import { SidebarProvider } from './components/ui/sidebar'
import { SignIn } from './components/Signin'
import { useState, useEffect } from 'react'

import { Dashboard } from './components/Dashboard'
import Agent from './components/Agent';
import CallAgent from './components/CallAgent';
import Conversation from './components/Conversation';
import Billing from './components/billing/Billing';
import Settings from './components/Setting';
import Domain from './components/domain/Domain';
import ChatbotPage from './components/ChatbotPage';
import VoiceBotPage from './components/VoiceBotPage';
//import Landing from "./Landing"

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
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Left Sidebar */}
        <AppSidebar />

        {/* Right Panel */}
        <div className="flex flex-col flex-1">
          {/* Top Navigation */}
          <Topbar />

          {/* Main Content Area */}
          <div className="flex-1 pr-3 pt-4 pl-3 bg-gray-50">
            <Routes>
              <Route
                path="/"
                element={
                  localStorage.getItem("token") ? (
                    <Dashboard />
                  ) : (
                    <SignIn onSuccess={() => setSignedIn(true)} />
                  )
                }
              />
              <Route path="/agents" element={<Agent />} />
              <Route path="/call-agent/:agentId" element={<CallAgent />} />
              <Route path="/call-history" element={<Conversation/>} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/domain/:domain" element={<Domain />} />
              <Route path="*" element={<div>Page Not Found</div>} />
              {/* <Route path="/landing" element={<Landing />} /> */}
            </Routes>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}

function App() {
  return <AppContent />;
}

export default App
