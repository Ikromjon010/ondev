import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useCurrentLesson() {
  const { user } = useAuth();
  const [currentLessonId, setCurrentLessonId] = useState(2); // first lesson id
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchCurrentLesson = async () => {
      // Get the last completed lesson's sort_order
      const { data: progress } = await supabase
        .from("user_progress")
        .select("lesson_id")
        .eq("user_id", user.id)
        .eq("completed", true)
        .order("lesson_id", { ascending: false })
        .limit(1)
        .single();

      if (progress) {
        // Next lesson after the last completed one
        const { data: nextLesson } = await supabase
          .from("lessons")
          .select("id")
          .gt("id", progress.lesson_id)
          .order("id", { ascending: true })
          .limit(1)
          .single();

        setCurrentLessonId(nextLesson?.id || progress.lesson_id);
      } else {
        // No progress — start from first lesson
        const { data: firstLesson } = await supabase
          .from("lessons")
          .select("id")
          .order("id", { ascending: true })
          .limit(1)
          .single();

        setCurrentLessonId(firstLesson?.id || 2);
      }
      setLoading(false);
    };

    fetchCurrentLesson();
  }, [user]);

  return { currentLessonId, loading };
}
