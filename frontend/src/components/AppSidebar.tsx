"use client";

import {
  Activity,
  BarChart3,
  Contact,
  Home,
  Settings,
  Zap,
  Plus,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  //SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
//import { Avatar, AvatarFallback } from "./ui/avatar";
import DomainWizard from '../components/domain/DomainWizard'
import { useState, useEffect } from "react";
import { BACKEND_URL } from "../lib/utils";


const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Agents", url: "/agents", icon: Activity },
  { title: "Call History", url: "/call-history", icon: Contact },
  { title: "Billing & Credits", url: "/billing", icon: Zap },
  { title: "Settings", url: "/settings", icon: Settings },
  //{ title: "Landing", url: "/landing", icon: Settings },
];

interface Domain{
  domainId: string;
  domainName: string;
  domainUrl: string;
  domainImageUrl: string;
}

export function AppSidebar() {
  const location = useLocation();
  //const avatar = localStorage.getItem("name")
  const [domainWizard, setDomainWizard] = useState(false)
  const [domains, setDomains] = useState<Domain[]>([])

  const fetchDomains = async () => {
    try{
      const response = await fetch(`${BACKEND_URL}/domain/get-domain`, {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      if(!response.ok) throw new Error("failed to fetch domains")
      const allDomains = await response.json()
      console.log(allDomains)
      setDomains(allDomains)
    } catch(e){
      console.log(e)
    }
  }

  useEffect(()=>{
    fetchDomains()
  }, [])

  return (
    <Sidebar className="border-r">
      {/* Logo */}
      <SidebarHeader className="px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <BarChart3 className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold">Conversia</span>
        </div>
      </SidebarHeader>

      {/* Menu */}
      <SidebarContent className="px-2">
        <SidebarGroup>
          <span className="mb-2 text-gray-600 text-sm">Menu</span>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <Link to={item.url}>
                      <SidebarMenuButton
                        className={`flex items-center gap-2 px-3 py-2 rounded-md transition cursor-pointer ${
                          isActive
                            ? "bg-white text-black font-semibold border border-1"
                            : "bg-white text-black"
                        }${
                          !isActive ? " hover:text-black hover:bg-gray-200" : ""
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent className="mb-2">
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Domains</span>
              <Plus onClick={() => {setDomainWizard(true)}} className="w-5 h-5 text-gray-500 hover:text-gray-900 cursor-pointer"/>
              {domainWizard && ( <DomainWizard onClose={() => setDomainWizard(false)} onSuccess={fetchDomains} /> )}
            </div>
            <SidebarMenu className="mt-2">
              {domains.map((item) => {
                const isActive = location.pathname === item.domainUrl;
                return (
                  <SidebarMenuItem key={item.domainName}>
                    <Link to={`/domain/${item.domainUrl}`} state={item.domainName ? { domainName: item.domainName, domainUrl: item.domainUrl, domainImageUrl: item.domainImageUrl } : undefined}>
                      <SidebarMenuButton
                        className={`flex items-center gap-2 px-3 py-2 rounded-md transition cursor-pointer ${
                          isActive
                            ? "bg-white text-black font-semibold border border-1"
                            : "bg-white text-black"
                        }${
                          !isActive ? " hover:text-black hover:bg-gray-200" : ""
                        }`}
                      >
                        <img
                          src={`${item.domainImageUrl}`}
                          alt="Logo preview"
                          className="h-4 w-4 align-center"
                        />
                        <span>{item.domainUrl}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User footer 
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 bg-black outline-black outline-1 outline-offset-2">
            <AvatarFallback className="text-bold">{avatar?.slice(0,1).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{`${avatar?.slice(0,1).toUpperCase()}${avatar?.slice(1)}`}</span>
          </div>
        </div>
      </SidebarFooter>
      */}
    </Sidebar>
  );
}
