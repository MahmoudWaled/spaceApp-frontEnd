"use client"

import { useContext, useState } from "react"
import { Search, Bell, MessageCircle, Menu, Settings, User, LogOut, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "../theme-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useNavigate } from "react-router-dom"
import { UserContext } from "@/context/UserContext"

export function Navbar() {
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const recentSearches = ["Space exploration", "Mars mission", "Astronomy news", "NASA updates", "SpaceX launch"]

 const loggedUser = useContext(UserContext)
  
  const navigate = useNavigate()
function logOutHandler(){
    localStorage.removeItem('token');
    navigate('/login')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-red-500">Space</span>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="search"
                placeholder="Search Space topics..."
                className={`pl-10 transition-all duration-200 ${isSearchFocused ? "ring-2 ring-red-500" : ""}`}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </div>
          </div>

          {/* Mobile Search Icon */}
          <div className="md:hidden">
            <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Search className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Search Space</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input type="search" placeholder="Search Space topics..." className="pl-10" autoFocus />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Recent Searches</h4>
                    {recentSearches.map((search, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start text-sm"
                        onClick={() => setIsSearchOpen(false)}
                      >
                        <Search className="w-4 h-4 mr-2 text-muted-foreground" />
                        {search}
                      </Button>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <ThemeToggle />

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
            </Button>

            <Button variant="ghost" size="icon">
              <MessageCircle className="w-5 h-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={loggedUser?.userData?.avatar ? `http://localhost:5000/Uploads/${loggedUser?.userData?.avatar}`:"/placeholder-avatar.jpg" } alt="User" />
                    <AvatarFallback className="bg-red-500 text-white">U</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut onClick={logOutHandler}  className="mr-2 h-4 w-4" />
                  <span onClick={logOutHandler}>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  {/* Mobile Navigation Items */}
                  <div className="flex items-center justify-between py-2">
                    <span>Theme</span>
                    <ThemeToggle />
                  </div>

                  <Button variant="ghost" className="justify-start" size="sm">
                    <Bell className="mr-2 w-4 h-4" />
                    Notifications
                    <span className="ml-auto w-2 h-2 bg-red-500 rounded-full"></span>
                  </Button>

                  <Button variant="ghost" className="justify-start" size="sm">
                    <MessageCircle className="mr-2 w-4 h-4" />
                    Messages
                  </Button>

                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={loggedUser?.userData?.avatar ? `http://localhost:5000/Uploads/${loggedUser?.userData?.avatar}`:"/placeholder-avatar.jpg" } alt="User" />
                        <AvatarFallback className="bg-red-500 text-white">U</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">John Doe</p>
                        <p className="text-sm text-muted-foreground">@johndoe</p>
                      </div>
                    </div>

                    <Button variant="ghost" className="justify-start w-full" size="sm">
                      <User className="mr-2 w-4 h-4" />
                      Profile
                    </Button>

                    <Button variant="ghost" className="justify-start w-full" size="sm">
                      <Settings className="mr-2 w-4 h-4" />
                      Settings
                    </Button>

                    <Button variant="ghost" className="justify-start w-full text-red-600" size="sm">
                      <LogOut onClick={logOutHandler} className="mr-2 w-4 h-4" />
                      <span onClick={logOutHandler} >

                      Sign Out
                      </span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
