CREATE POLICY "Users can issue own certificate"
ON public.certificates FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE UNIQUE INDEX IF NOT EXISTS certificates_user_course_unique
ON public.certificates(user_id, course_id);