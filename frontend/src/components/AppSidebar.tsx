"use client";

import {
  Activity,Contact,Home,Settings,Zap,Plus,Network, BookUser, ArrowRightToLine
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
  SidebarFooter
} from "./ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { Avatar, AvatarFallback } from "./ui/avatar";
import DomainWizard from '../components/domain/DomainWizard'
import { useState, useEffect } from "react";
import { BACKEND_URL } from "../lib/utils";


const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Chat History", url: "/chat-history", icon:Contact  },
  { title: "Call History", url: "/call-history", icon:Activity  },
  { title: "Workflows", url: "/workflow", icon: Network },
  { title: "Knowledge Base", url: "/knowledge-base", icon: BookUser },
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
interface User{
  name: string,
  email: string,
  isPremium: boolean
}
const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("name");
  window.location.reload();
};

export function AppSidebar() {
  const location = useLocation();
  //const avatar = localStorage.getItem("name")
  const [domainWizard, setDomainWizard] = useState(false)
  const [domains, setDomains] = useState<Domain[]>([])
  const [user, setUser] = useState<User>({ name: "", email: "", isPremium: false })

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
      const { allDomains, user } = await response.json();
      setDomains(allDomains);
      setUser({...user, name:user.name, email:user.email, isPremium:user.plan})
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
        <div className="flex items-center gap-1">
          <div className="flex items-center justify-center rounded-lg">
            <img src="/favConversia.svg" alt="Conversia logo" className="h-10 w-10" />
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
                    <Link to={`/domain/${item.domainUrl}`} state={item.domainName ? { domainId: item.domainId, domainName: item.domainName, domainUrl: item.domainUrl, domainImageUrl: item.domainImageUrl } : undefined}>
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

      { /* User footer */ }
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 bg-black flex-shrink-0">
            <AvatarFallback className="text-white font-semibold flex items-center justify-center">
              {user.name?.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col justify-center flex-1 min-w-0">
            <p className="text-sm truncate">{user.email?.slice(0,1).toUpperCase() + user.email?.slice(1,)}</p>
            {!user.isPremium ? (
              <p className="text-xs text-gray-500 font-semibold">Free</p>
            ) : (
              <p className="text-xs text-yellow-600 font-semibold">Premium User</p>
            )}
          </div>
          <div className="flex items-center h-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <ArrowRightToLine className="w-4 h-4 cursor-pointer text-gray-600 hover:text-gray-900" />       
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/pricing">Upgrade</a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </SidebarFooter>
      
    </Sidebar>
  );
}
