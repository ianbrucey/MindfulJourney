import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Book, Brain, Settings, Zap, MessageCircle } from "lucide-react";

const routes = [
  { name: "Journal", path: "/", icon: Book },
  { name: "Meditation", path: "/meditation", icon: Brain },
  { name: "Productivity", path: "/productivity", icon: Zap },
  { name: "Talk it out", path: "/talk", icon: MessageCircle },
  { name: "Settings", path: "/settings", icon: Settings },
];

export default function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around md:justify-start md:gap-8 h-16">
          {routes.map((route) => {
            const Icon = route.icon;
            const isActive = location === route.path;

            return (
              <Link key={route.path} href={route.path}>
                <a
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    "md:px-4",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="hidden md:inline">{route.name}</span>
                </a>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}