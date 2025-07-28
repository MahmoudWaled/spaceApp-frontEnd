import { Home, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "@/context/UserContext";

const navigationItems = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Profile",
    href: "/profile/:userId",
    icon: User,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function LeftSidebar() {
  const location = useLocation();
  const loggedUser = useContext(UserContext);

  return (
    <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-64 lg:pt-16">
      <div className="flex flex-col flex-1 bg-background border-r">
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            // Replace :userId with actual user ID for profile link
            const href =
              item.href === "/profile/:userId"
                ? `/profile/${loggedUser?.userData?.id || ""}`
                : item.href;

            const isActive = location.pathname === href;
            return (
              <Button
                key={item.name}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start text-left",
                  isActive && "bg-red-500 hover:bg-red-600 text-white"
                )}
                asChild
              >
                <Link to={href}>
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
