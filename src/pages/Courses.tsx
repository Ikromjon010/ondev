import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Lock, ArrowRight } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { useCourses, useUserCourseAccess, setActiveCourseSlug } from "@/hooks/useCourses";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Courses = () => {
  const { courses, loading } = useCourses();
  const { access, getTier } = useUserCourseAccess();
  const { user } = useAuth();
  const navigate = useNavigate();

  const startCourse = async (courseId: string, slug: string, isPublished: boolean) => {
    if (!isPublished) {
      toast.info("Bu kurs tez orada ochiladi!");
      return;
    }
    if (user && !getTier(courseId)) {
      // Self-enroll free tier
      await supabase.from("user_course_access").insert({
        user_id: user.id,
        course_id: courseId,
        tier: "free",
      });
    }
    setActiveCourseSlug(slug);
    navigate("/syllabus");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Kurslar katalogi</h1>
          <p className="text-muted-foreground">
            O'zingizga mos yo'nalishni tanlang va o'rganishni boshlang
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course, i) => {
              const tier = getTier(course.id);
              const enrolled = !!tier;
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`glass-card p-6 flex flex-col ${
                    !course.is_published ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-5xl">{course.icon}</div>
                    {!course.is_published ? (
                      <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-muted text-muted-foreground flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Tez orada
                      </span>
                    ) : enrolled ? (
                      <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-primary/20 text-primary flex items-center gap-1">
                        <Check className="w-3 h-3" /> Ochiq
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-accent/20 text-accent">
                        Yangi
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">{course.title}</h3>
                  <p className="text-xs uppercase text-muted-foreground mb-3 font-mono">
                    {course.language}
                  </p>
                  <p className="text-sm text-muted-foreground flex-1 mb-4">
                    {course.description}
                  </p>
                  <Button
                    onClick={() => startCourse(course.id, course.slug, course.is_published)}
                    disabled={!course.is_published}
                    variant={enrolled ? "default" : "outline"}
                    className="w-full gap-1"
                  >
                    {enrolled ? "Davom etish" : course.is_published ? "Boshlash" : "Tez orada"}
                    {course.is_published && <ArrowRight className="w-4 h-4" />}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Courses;
