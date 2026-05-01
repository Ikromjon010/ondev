import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  icon: string;
  color: string;
  language: string;
  is_published: boolean;
  sort_order: number;
}

export interface CourseAccess {
  course_id: string;
  tier: string;
}

const ACTIVE_COURSE_KEY = "ondev:activeCourseSlug";

export function getActiveCourseSlug(): string {
  return localStorage.getItem(ACTIVE_COURSE_KEY) || "python-backend";
}

export function setActiveCourseSlug(slug: string) {
  localStorage.setItem(ACTIVE_COURSE_KEY, slug);
}

export function useCourses(opts?: { onlyPublished?: boolean }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      let q = supabase.from("courses").select("*").order("sort_order");
      if (opts?.onlyPublished) q = q.eq("is_published", true);
      const { data } = await q;
      setCourses((data as Course[]) || []);
      setLoading(false);
    };
    fetch();
  }, [opts?.onlyPublished]);

  return { courses, loading };
}

export function useUserCourseAccess() {
  const { user } = useAuth();
  const [access, setAccess] = useState<CourseAccess[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetch = async () => {
      const { data } = await supabase
        .from("user_course_access")
        .select("course_id, tier")
        .eq("user_id", user.id);
      setAccess((data as CourseAccess[]) || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const getTier = (courseId: string) =>
    access.find((a) => a.course_id === courseId)?.tier || null;

  return { access, getTier, loading };
}

export function useActiveCourse() {
  const { courses } = useCourses();
  const [slug, setSlug] = useState(getActiveCourseSlug());
  const active = courses.find((c) => c.slug === slug) || courses.find((c) => c.slug === "python-backend") || courses[0] || null;

  const switchCourse = (newSlug: string) => {
    setActiveCourseSlug(newSlug);
    setSlug(newSlug);
  };

  return { activeCourse: active, switchCourse, courses };
}
