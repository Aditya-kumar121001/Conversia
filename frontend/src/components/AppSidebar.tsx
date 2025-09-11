"use client"

import { BarChart3, Contact, Home, Settings, Zap, DollarSign } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Agents", url: "/agents", icon: DollarSign },
  { title: "Call History", url: "/call-history", icon: Contact },
  { title: "Billing & Credits", url: "/bill-credits", icon: Zap },
  { title: "Settings", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar className="border-r">
      {/* Logo */}
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <BarChart3 className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold">Conversia</span>
        </div>
      </SidebarHeader>

      {/* Menu */}
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <Link to={item.url}>
                      <SidebarMenuButton
                        className={`flex items-center gap-2 px-3 py-2 rounded-md transition ${
                          isActive
                            ? "bg-black text-white focus:border-none"
                            : "hover:bg-gray-400 text-gray-400"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User footer */}
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 outline-black outline-1 outline-offset-2">
            <AvatarImage
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
              alt="John Doe"
              className="object-cover"
            />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">John Doe</span>
            <span className="text-xs text-muted-foreground">Sales Manager</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
