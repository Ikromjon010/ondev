-- 1. Courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT '📚',
  color TEXT NOT NULL DEFAULT 'primary',
  language TEXT NOT NULL DEFAULT 'python',
  is_published BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Seed initial courses
INSERT INTO public.courses (slug, title, description, icon, color, language, is_published, sort_order) VALUES
  ('python-backend', 'Python Backend (Django)', '9 oylik to''liq Python va Django backend dasturlash kursi. Asoslardan productionga.', '🐍', 'primary', 'python', true, 1),
  ('frontend-react', 'Frontend (React)', 'Zamonaviy frontend dasturlash: HTML, CSS, JavaScript va React.', '⚛️', 'accent', 'javascript', false, 2),
  ('mobile-flutter', 'Mobile (Flutter)', 'iOS va Android uchun Flutter va Dart bilan mobil ilovalar yaratish.', '📱', 'warning', 'dart', false, 3);

-- 3. Add course_id to modules and backfill
ALTER TABLE public.modules ADD COLUMN course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;

UPDATE public.modules SET course_id = (SELECT id FROM public.courses WHERE slug = 'python-backend');

ALTER TABLE public.modules ALTER COLUMN course_id SET NOT NULL;
CREATE INDEX idx_modules_course_id ON public.modules(course_id);

-- 4. Add optional language override to lessons
ALTER TABLE public.lessons ADD COLUMN language TEXT;

-- 5. user_course_access table
CREATE TABLE public.user_course_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'free',
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.user_course_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own course access" ON public.user_course_access
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all course access" ON public.user_course_access
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage course access" ON public.user_course_access
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can self-enroll free tier" ON public.user_course_access
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND tier = 'free');

CREATE TRIGGER update_user_course_access_updated_at BEFORE UPDATE ON public.user_course_access
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_user_course_access_user ON public.user_course_access(user_id);
CREATE INDEX idx_user_course_access_course ON public.user_course_access(course_id);

-- 6. Backfill from profiles.active_tier into user_course_access for python-backend
INSERT INTO public.user_course_access (user_id, course_id, tier)
SELECT p.user_id, c.id, p.active_tier
FROM public.profiles p
CROSS JOIN public.courses c
WHERE c.slug = 'python-backend'
ON CONFLICT (user_id, course_id) DO NOTHING;

-- 7. Add course_id to payments and certificates
ALTER TABLE public.payments ADD COLUMN course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL;
UPDATE public.payments SET course_id = (SELECT id FROM public.courses WHERE slug = 'python-backend') WHERE course_id IS NULL;

ALTER TABLE public.certificates ADD COLUMN course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL;
UPDATE public.certificates SET course_id = (SELECT id FROM public.courses WHERE slug = 'python-backend') WHERE course_id IS NULL;