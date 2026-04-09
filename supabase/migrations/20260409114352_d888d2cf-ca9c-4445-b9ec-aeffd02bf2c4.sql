
-- Create badges definition table
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🏆',
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('lessons_completed', 'streak_days', 'total_points', 'tasks_completed')),
  requirement_value INTEGER NOT NULL,
  points_reward INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges" ON public.badges FOR SELECT USING (true);
CREATE POLICY "Admins can manage badges" ON public.badges FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Create user_badges junction table
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges" ON public.user_badges FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view all badges for leaderboard" ON public.user_badges FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can insert badges" ON public.user_badges FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage user badges" ON public.user_badges FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed default badges
INSERT INTO public.badges (name, description, icon, requirement_type, requirement_value, points_reward) VALUES
  ('Birinchi qadam', '10 ta darsni tugatish', '🌱', 'lessons_completed', 10, 50),
  ('Bilim izlovchi', '25 ta darsni tugatish', '📖', 'lessons_completed', 25, 100),
  ('Yarmi bosib o''tildi', '50 ta darsni tugatish', '🔥', 'lessons_completed', 50, 200),
  ('Python ustasi', '100 ta darsni tugatish', '🐍', 'lessons_completed', 100, 500),
  ('3 kunlik streak', '3 kun ketma-ket o''qish', '⚡', 'streak_days', 3, 30),
  ('Haftalik streak', '7 kun ketma-ket o''qish', '🗓️', 'streak_days', 7, 70),
  ('Oylik streak', '30 kun ketma-ket o''qish', '💎', 'streak_days', 30, 300),
  ('Yuz ball', '100 ball to''plash', '⭐', 'total_points', 100, 20),
  ('Besh yuz ball', '500 ball to''plash', '🌟', 'total_points', 500, 50),
  ('Ming ball', '1000 ball to''plash', '👑', 'total_points', 1000, 100),
  ('Mashqchi', '5 ta topshiriq bajarish', '💪', 'tasks_completed', 5, 40),
  ('Tajribali', '20 ta topshiriq bajarish', '🎯', 'tasks_completed', 20, 150);
