import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

function genCredentialId() {
  const year = new Date().getFullYear();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  return `ONDEV-${year}-${suffix}`;
}

/**
 * Checks if the user finished every lesson in the given course; if so, issues
 * a certificate (idempotent — DB unique index prevents duplicates).
 */
export function useIssueCertificateOnComplete(courseId: string | null | undefined) {
  const { user, profile } = useAuth();

  useEffect(() => {
    if (!user || !courseId || !profile?.full_name) return;

    let cancelled = false;
    (async () => {
      // 1. Already issued?
      const { data: existing } = await supabase
        .from("certificates")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .maybeSingle();
      if (existing || cancelled) return;

      // 2. Get all lesson ids in this course
      const { data: modules } = await supabase
        .from("modules")
        .select("id")
        .eq("course_id", courseId);
      if (!modules?.length || cancelled) return;
      const moduleIds = modules.map((m) => m.id);

      const { data: lessons } = await supabase
        .from("lessons")
        .select("id")
        .in("module_id", moduleIds);
      if (!lessons?.length || cancelled) return;
      const lessonIds = lessons.map((l) => l.id);

      // 3. Get user progress for those lessons
      const { data: progress } = await supabase
        .from("user_progress")
        .select("lesson_id, completed")
        .eq("user_id", user.id)
        .in("lesson_id", lessonIds);

      const completedCount = progress?.filter((p) => p.completed).length || 0;
      if (completedCount < lessonIds.length || cancelled) return;

      // 4. Issue
      await supabase.from("certificates").insert({
        user_id: user.id,
        course_id: courseId,
        student_name: profile.full_name,
        credential_id: genCredentialId(),
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [user, courseId, profile?.full_name]);
}
