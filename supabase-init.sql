-- 2. Create a trigger to handle new users
-- This function is the same, but it now inserts into public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- This trigger on auth.users does not need to be changed as it calls the updated function.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Set up Row Level Security (RLS) for the users table
CREATE POLICY "Public user data is viewable by everyone."
  ON public.users FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own user data."
  ON public.users FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update their own user data."
  ON public.users FOR UPDATE
  USING ( auth.uid() = id );

-------- TASKS------------

-- 1. Create an enum type for the task status
CREATE TYPE public.task_status AS ENUM ('todo', 'inprogress', 'done');

-- 2. Create the tasks table
CREATE TABLE public.tasks (
  id bigserial PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  due_date timestamp with time zone,
  title text NOT NULL,
  status public.task_status DEFAULT 'todo' NOT NULL,
  task_type text, -- Renamed from 'type' to avoid using a reserved keyword
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- 3. Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for the tasks table
CREATE POLICY "Users can view their own tasks."
  ON public.tasks FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert their own tasks."
  ON public.tasks FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update their own tasks."
  ON public.tasks FOR UPDATE
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can delete their own tasks."
  ON public.tasks FOR DELETE
  USING ( auth.uid() = user_id );

ALTER TABLE public.tasks RENAME COLUMN created_at TO start_date;
ALTER TABLE public.tasks RENAME COLUMN due_date TO end_date;

ALTER TABLE public.tasks ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.tasks ALTER COLUMN status TYPE text;
DROP TYPE public.task_status;
CREATE TYPE public.task_status AS ENUM ('inprogress', 'done');
ALTER TABLE public.tasks ALTER COLUMN status TYPE public.task_status USING status::public.task_status;
ALTER TABLE public.tasks ALTER COLUMN status SET DEFAULT 'inprogress';

-- 2. Create task_type enum
CREATE TYPE public.task_type AS ENUM ('bili', 'appointment', 'punta', 'study');

-- 3. Alter tasks table to use new enum for task_type
ALTER TABLE public.tasks
  ALTER COLUMN task_type DROP DEFAULT,
  ALTER COLUMN task_type TYPE public.task_type USING task_type::public.task_type,
  ALTER COLUMN task_type DROP NOT NULL;
