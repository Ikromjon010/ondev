import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, BookOpen, Code2, GraduationCap, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useCurrentLesson } from "@/hooks/useCurrentLesson";

const AppHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut, profile } = useAuth();
  const { currentLessonId } = useCurrentLesson();

  const navItems = [
    { to: "/dashboard", label: "Asosiy oyna", icon: LayoutDashboard },
    { to: "/syllabus", label: "Kurs dasturi", icon: BookOpen },
    { to: `/lesson/${currentLessonId}`, label: "Joriy dars", icon: Code2 },
  ];
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut, profile } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

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
          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                location.pathname.startsWith("/admin")
                  ? "bg-warning/10 text-warning"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <Shield className="w-4 h-4" />
              Admin
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-2 ml-2">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                {profile?.full_name?.charAt(0) || "U"}
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1 text-muted-foreground">
                <LogOut className="w-4 h-4" /> Chiqish
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" asChild className="ml-2">
              <Link to="/login">Kirish</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
