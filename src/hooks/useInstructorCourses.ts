import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface InstructorCourse {
  id: string;
  slug: string;
  title: string;
  icon: string;
}

/**
 * Berilgan foydalanuvchi ustoz bo'lgan kurslarni qaytaradi.
 * Boshqa odamlar profilini ko'rganda ham ishlatamiz.
 */
export const useInstructorCourses = (userId?: string | null) => {
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setCourses([]);
      return;
    }
    setLoading(true);
    supabase
      .from("courses")
      .select("id, slug, title, icon")
      .eq("instructor_id", userId)
      .order("sort_order")
      .then(({ data }) => {
        setCourses((data as InstructorCourse[]) || []);
        setLoading(false);
      });
  }, [userId]);

  return { courses, loading, isInstructor: courses.length > 0 };
};
