/* eslint-disable @typescript-eslint/no-unused-vars */
import './App.css'
import './index.css'
import { Routes, Route } from 'react-router-dom';
import { Topbar } from './components/NavBar'
import { AppSidebar } from './components/AppSidebar'
import { SidebarProvider } from './components/ui/sidebar'
import { SignIn } from './components/Signin'
import { useState, useEffect } from 'react'

import { Dashboard } from './components/Dashboard'
import Agent from './components/Agent';
import CallAgent from './components/CallAgent';

function App() {
  const [signedIn, setSignedIn] = useState(false);

  // Auto-login if token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setSignedIn(true);
    }
  }, []);

  return (
    !signedIn ? (
      <SignIn onSuccess={() => setSignedIn(true)} />
    ) : (
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
                <Route path="/" element={<Dashboard />} />
                <Route path="/agents" element={<Agent />} />
                <Route path="*" element={<div>Page Not Found</div>} />
                <Route path="/call-agent/:agentId" element={<CallAgent />} />
              </Routes>
            </div>
          </div>
        </div>
      </SidebarProvider>
    )
  )
}

export default App
