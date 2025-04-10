
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  BarChart2, 
  Briefcase, 
  Clock, 
  Settings
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar = ({ isOpen }: SidebarProps) => {
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Briefcase, label: "Portfolio", href: "/portfolio" },
    { icon: BarChart2, label: "Stocks", href: "/stocks" },
    { icon: Clock, label: "Transactions", href: "/transactions" },
  ];

  return (
    <aside
      className={cn(
        "bg-background border-r border-border transition-all duration-300 ease-in-out overflow-hidden",
        isOpen ? "w-64" : "w-0 md:w-16"
      )}
    >
      <div className="h-full flex flex-col py-4">
        <div className="px-4 mb-6">
          {isOpen && (
            <h2 className="text-sm font-semibold text-muted-foreground">
              MENU
            </h2>
          )}
        </div>
        <nav className="space-y-1 px-2 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-2 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-purple-500 text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <item.icon size={20} className={cn("flex-shrink-0", isOpen ? "mr-3" : "mx-auto")} />
              {isOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        {/* <div className="px-2 mt-6">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                "flex items-center px-2 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-purple-500 text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <Settings size={20} className={cn("flex-shrink-0", isOpen ? "mr-3" : "mx-auto")} />
            {isOpen && <span>Settings</span>}
          </NavLink>
        </div> */}
      </div>
    </aside>
  );
};

export default Sidebar;
