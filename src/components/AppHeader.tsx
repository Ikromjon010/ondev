import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, BookOpen, Code2, GraduationCap } from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Asosiy oyna", icon: LayoutDashboard },
  { to: "/syllabus", label: "Kurs dasturi", icon: BookOpen },
  { to: "/lesson/2", label: "Joriy dars", icon: Code2 },
];

const AppHeader = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex items-center justify-between h-14 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground">
            on<span className="text-primary">dev</span>.uz
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
