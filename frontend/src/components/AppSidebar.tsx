"use client";

import {
  Activity,Contact,Home,Settings,Zap,Plus,Network, BookUser, ArrowRightToLine, Sparkles
} from "lucide-react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
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
import { useState } from "react";
import { useTenant } from "../context/Context";


const menuItems = [
  { title: "Dashboard", url: "/", icon: Home, premiumOnly: false },
  { title: "Chat History", url: "/chat-history", icon:Contact, premiumOnly: false  },
  { title: "Call History", url: "/call-history", icon:Activity, premiumOnly: true  },
  { title: "Workflows", url: "/workflow", icon: Network, premiumOnly: false  },
  { title: "Knowledge Base", url: "/knowledge-base", icon: BookUser, premiumOnly: false  },
  { title: "Billing & Credits", url: "/billing", icon: Zap, premiumOnly: false  },
  { title: "Settings", url: "/settings", icon: Settings, premiumOnly: false  },
];

const handleLogout = () => {
  localStorage.removeItem("token");
  window.location.reload();
};

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [domainWizard, setDomainWizard] = useState(false);
  const { domains, user: tenantUser, refreshUser } = useTenant();
  const user = tenantUser || { name: "", email: "", isPremium: false };

  return (
    <Sidebar className="border-r">
      {/* Logo */}
      <SidebarHeader className="px-4 py-4">
        <div className="flex align-center items-center gap-1">
          <img src="/conversiaLogo.svg" alt="Conversia logo" className="h-8 w-8" />
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
                        {item.premiumOnly && !user.isPremium && (
                          <span className="ml-auto text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full leading-none">
                            PRO
                          </span>
                        )}
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
              {domainWizard && ( <DomainWizard onClose={() => setDomainWizard(false)} onSuccess={refreshUser} /> )}
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

        {/* Upgrade Banner for free users */}
        {!user.isPremium && (
          <div className="mx-2 mb-2">
            <div
              onClick={() => navigate("/billing")}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 cursor-pointer hover:from-gray-800 hover:to-gray-700 transition-all group"
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex-shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white">
                  Upgrade to Pro
                </p>
                <p className="text-[10px] text-gray-400">
                  Unlock all features
                </p>
              </div>
            </div>
          </div>
        )}
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
              <p className="text-xs text-blue-700 font-semibold flex items-center gap-1">
                Premium
              </p>
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
                  <Link to="/billing">
                    {user.isPremium ? "Manage Plan" : "Upgrade"}
                  </Link>
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
