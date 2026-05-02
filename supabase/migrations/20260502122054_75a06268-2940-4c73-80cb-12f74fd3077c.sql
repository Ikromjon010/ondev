-- 1) Add 'instructor' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'instructor';

-- 2) Add instructor_id to courses
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS instructor_id uuid;
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON public.courses(instructor_id);

-- 3) Helper: is the current user the instructor of a given course?
CREATE OR REPLACE FUNCTION public.is_course_instructor(_user_id uuid, _course_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.courses
    WHERE id = _course_id AND instructor_id = _user_id
  )
$$;

-- 4) Helper: is the current user the instructor of the course owning this module?
CREATE OR REPLACE FUNCTION public.is_module_instructor(_user_id uuid, _module_id integer)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.modules m
    JOIN public.courses c ON c.id = m.course_id
    WHERE m.id = _module_id AND c.instructor_id = _user_id
  )
$$;

-- 5) Helper: is the current user the instructor of the course owning this lesson?
CREATE OR REPLACE FUNCTION public.is_lesson_instructor(_user_id uuid, _lesson_id integer)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.lessons l
    JOIN public.modules m ON m.id = l.module_id
    JOIN public.courses c ON c.id = m.course_id
    WHERE l.id = _lesson_id AND c.instructor_id = _user_id
  )
$$;

-- 6) RLS: instructors can manage their own course row
CREATE POLICY "Instructors can update own course"
ON public.courses
FOR UPDATE
TO authenticated
USING (instructor_id = auth.uid())
WITH CHECK (instructor_id = auth.uid());

-- 7) RLS: instructors can manage modules in their courses
CREATE POLICY "Instructors manage own course modules"
ON public.modules
FOR ALL
TO authenticated
USING (public.is_course_instructor(auth.uid(), course_id))
WITH CHECK (public.is_course_instructor(auth.uid(), course_id));

-- 8) RLS: instructors can manage lessons in their courses
CREATE POLICY "Instructors manage own course lessons"
ON public.lessons
FOR ALL
TO authenticated
USING (public.is_module_instructor(auth.uid(), module_id))
WITH CHECK (public.is_module_instructor(auth.uid(), module_id));

-- 9) RLS: instructors can view progress of students enrolled in their courses
CREATE POLICY "Instructors can view progress in own courses"
ON public.user_progress
FOR SELECT
TO authenticated
USING (public.is_lesson_instructor(auth.uid(), lesson_id));

-- 10) RLS: instructors can view payments for their courses
CREATE POLICY "Instructors can view own course payments"
ON public.payments
FOR SELECT
TO authenticated
USING (course_id IS NOT NULL AND public.is_course_instructor(auth.uid(), course_id));

-- 11) RLS: instructors can view course access enrollments for their courses
CREATE POLICY "Instructors can view own course enrollments"
ON public.user_course_access
FOR SELECT
TO authenticated
USING (public.is_course_instructor(auth.uid(), course_id));