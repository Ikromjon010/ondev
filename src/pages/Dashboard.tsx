import { Link } from "react-router-dom";
import { ArrowRight, Plus } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import ProgressOverview from "@/components/ProgressOverview";
import GamificationSidebar from "@/components/GamificationSidebar";
import { useCourses, useUserCourseAccess, setActiveCourseSlug } from "@/hooks/useCourses";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { courses } = useCourses({ onlyPublished: true });
  const { access } = useUserCourseAccess();

  const myCourses = courses.filter((c) => access.some((a) => a.course_id === c.id));

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container px-4 py-6">
        {/* My courses strip */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Mening kurslarim
            </h2>
            <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
              <Link to="/courses"><Plus className="w-3 h-3" /> Yangi kurs qo'shish</Link>
            </Button>
          </div>
          {myCourses.length === 0 ? (
            <div className="glass-card p-6 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Hali kursga yozilmagansiz</p>
                <p className="text-sm text-muted-foreground">Katalogdan o'zingizga mos yo'nalishni tanlang</p>
              </div>
              <Button asChild>
                <Link to="/courses">Katalogni ochish <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {myCourses.map((c) => {
                const tier = access.find((a) => a.course_id === c.id)?.tier || "free";
                return (
                  <Link
                    key={c.id}
                    to="/syllabus"
                    onClick={() => setActiveCourseSlug(c.slug)}
                    className="glass-card px-3 py-2 flex items-center gap-2 hover:border-primary/40 transition-colors"
                  >
                    <span className="text-xl">{c.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.title}</p>
                      <p className="text-[10px] uppercase text-muted-foreground">{tier}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-6">
          <ProgressOverview />
          <GamificationSidebar />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
