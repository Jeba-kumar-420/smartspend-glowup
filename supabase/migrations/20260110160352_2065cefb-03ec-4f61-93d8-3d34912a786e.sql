-- Create savings table
CREATE TABLE public.savings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for savings
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;

-- RLS policies for savings
CREATE POLICY "Users can view their own savings" ON public.savings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own savings" ON public.savings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own savings" ON public.savings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own savings" ON public.savings FOR DELETE USING (auth.uid() = user_id);

-- Create savings_goals table
CREATE TABLE public.savings_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  target_amount NUMERIC NOT NULL DEFAULT 0,
  current_amount NUMERIC NOT NULL DEFAULT 0,
  deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for savings_goals
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

-- RLS policies for savings_goals
CREATE POLICY "Users can view their own savings_goals" ON public.savings_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own savings_goals" ON public.savings_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own savings_goals" ON public.savings_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own savings_goals" ON public.savings_goals FOR DELETE USING (auth.uid() = user_id);

-- Add trigger for updated_at on savings_goals
CREATE TRIGGER update_savings_goals_updated_at
  BEFORE UPDATE ON public.savings_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_savings_user_id ON public.savings(user_id);
CREATE INDEX idx_savings_goals_user_id ON public.savings_goals(user_id);