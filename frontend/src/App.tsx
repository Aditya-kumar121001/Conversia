import './App.css'
import './index.css'
import { Topbar } from './components/NavBar'
import { AppSidebar } from './components/AppSidebar'
import { SidebarProvider } from './components/ui/sidebar'
import { ContactForm } from './components/ContactForm'

function App() {
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
          <div className="flex-1 p-6 bg-gray-50 ">
            <div className="flex justify-center w-full">
              <ContactForm/>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default App
