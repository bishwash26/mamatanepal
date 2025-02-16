/*
  # Initial Schema Setup for Pregnancy Forum

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text)
      - `avatar_url` (text)
      - `created_at` (timestamp)
    - `posts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `author_id` (uuid, references profiles)
      - `created_at` (timestamp)
    - `comments`
      - `id` (uuid, primary key)
      - `content` (text)
      - `post_id` (uuid, references posts)
      - `author_id` (uuid, references profiles)
      - `created_at` (timestamp)
    - `blogs`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `image_url` (text)
      - `author_id` (uuid, references profiles)
      - `created_at` (timestamp)
    - `likes`
      - `id` (uuid, primary key)
      - `post_id` (uuid, references posts)
      - `author_id` (uuid, references profiles)
      - `created_at` (timestamp)
    - `videos`
      - `id` (uuid, primary key)
      - `title` (text)
      - `thumbnail_url` (text)
      - `youtube_id` (text)
      - `duration` (text)
      - `created_at` (timestamp)
      - `author_id` (uuid, references profiles)
      - `description` (text)
      - `views` (integer)
    - `shorts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `thumbnail_url` (text)
      - `youtube_id` (text)
      - `duration` (text)
      - `created_at` (timestamp)
      - `author_id` (uuid, references profiles)
      - `description` (text)
      - `views` (integer)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create user role enum type
CREATE TYPE user_role AS ENUM ('user', 'doctor');

-- Create tables
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  role user_role NOT NULL DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  image_url text,
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create likes table
CREATE TABLE IF NOT EXISTS public.likes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
    author_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(post_id, author_id)  -- Prevent multiple likes from same user
);

-- Drop and recreate videos table with correct foreign key
DROP TABLE IF EXISTS public.videos;
CREATE TABLE public.videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  thumbnail_url TEXT,
  youtube_id TEXT NOT NULL,
  duration TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  description TEXT,
  views INTEGER DEFAULT 0
);

-- Drop and recreate shorts table with correct foreign key
DROP TABLE IF EXISTS public.shorts;
CREATE TABLE public.shorts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  thumbnail_url TEXT,
  youtube_id TEXT NOT NULL,
  duration TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  description TEXT,
  views INTEGER DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE shorts ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$ 
BEGIN
    -- Check and create policies for profiles
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Public profiles are viewable by everyone'
    ) THEN
        CREATE POLICY "Public profiles are viewable by everyone"
        ON profiles FOR SELECT
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Users can insert their own profile'
    ) THEN
        CREATE POLICY "Users can insert their own profile"
        ON profiles FOR INSERT
        WITH CHECK (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile"
        ON profiles FOR UPDATE
        USING (auth.uid() = id);
    END IF;

    -- Check and create policies for posts
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'posts' 
        AND policyname = 'Users can read all posts'
    ) THEN
        CREATE POLICY "Users can read all posts" 
        ON posts FOR SELECT
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'posts' 
        AND policyname = 'Authenticated users can create posts'
    ) THEN
        CREATE POLICY "Authenticated users can create posts" 
        ON posts FOR INSERT
        WITH CHECK (auth.uid() = author_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'posts' 
        AND policyname = 'Users can update their own posts'
    ) THEN
        CREATE POLICY "Users can update their own posts" ON public.posts
            FOR UPDATE USING (auth.uid() = author_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'posts' 
        AND policyname = 'Users can delete their own posts'
    ) THEN
        CREATE POLICY "Users can delete their own posts" ON public.posts
            FOR DELETE USING (auth.uid() = author_id);
    END IF;

    -- Check and create policies for comments
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'comments' 
        AND policyname = 'Comments are viewable by everyone'
    ) THEN
        CREATE POLICY "Comments are viewable by everyone"
        ON comments FOR SELECT
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'comments' 
        AND policyname = 'Authenticated users can create comments'
    ) THEN
        CREATE POLICY "Authenticated users can create comments"
        ON comments FOR INSERT
        WITH CHECK (auth.uid() = author_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'comments' 
        AND policyname = 'Users can update own comments'
    ) THEN
        CREATE POLICY "Users can update own comments"
        ON comments FOR UPDATE
        USING (auth.uid() = author_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'comments' 
        AND policyname = 'Users can delete own comments'
    ) THEN
        CREATE POLICY "Users can delete own comments"
        ON comments FOR DELETE
        USING (auth.uid() = author_id);
    END IF;

    -- Check and create policies for blogs
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'blogs' 
        AND policyname = 'Blogs are viewable by everyone'
    ) THEN
        CREATE POLICY "Blogs are viewable by everyone"
        ON blogs FOR SELECT
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'blogs' 
        AND policyname = 'Authenticated users can create blogs'
    ) THEN
        CREATE POLICY "Authenticated users can create blogs"
        ON blogs FOR INSERT
        WITH CHECK (auth.uid() = author_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'blogs' 
        AND policyname = 'Users can update own blogs'
    ) THEN
        CREATE POLICY "Users can update own blogs"
        ON blogs FOR UPDATE
        USING (auth.uid() = author_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'blogs' 
        AND policyname = 'Users can delete own blogs'
    ) THEN
        CREATE POLICY "Users can delete own blogs"
        ON blogs FOR DELETE
        USING (auth.uid() = author_id);
    END IF;

    -- Check and create policies for likes
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'likes' 
        AND policyname = 'Users can read all likes'
    ) THEN
        CREATE POLICY "Users can read all likes"
        ON likes FOR SELECT
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'likes' 
        AND policyname = 'Authenticated users can create likes'
    ) THEN
        CREATE POLICY "Authenticated users can create likes"
        ON likes FOR INSERT
        WITH CHECK (auth.uid() = author_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'likes' 
        AND policyname = 'Users can delete their own likes'
    ) THEN
        CREATE POLICY "Users can delete their own likes"
        ON likes FOR DELETE
        USING (auth.uid() = author_id);
    END IF;

    -- Add policies for doctors
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'blogs' 
        AND policyname = 'Doctors can create blogs'
    ) THEN
        CREATE POLICY "Doctors can create blogs" ON blogs
        FOR INSERT WITH CHECK (
            auth.uid() IN (
                SELECT id FROM profiles 
                WHERE role = 'doctor'
            )
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'blogs' 
        AND policyname = 'Doctors can update own blogs'
    ) THEN
        CREATE POLICY "Doctors can update own blogs" ON blogs
        FOR UPDATE USING (
            auth.uid() = author_id 
            AND 
            auth.uid() IN (
                SELECT id FROM profiles 
                WHERE role = 'doctor'
            )
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'blogs' 
        AND policyname = 'Doctors can delete own blogs'
    ) THEN
        CREATE POLICY "Doctors can delete own blogs" ON blogs
        FOR DELETE USING (
            auth.uid() = author_id 
            AND 
            auth.uid() IN (
                SELECT id FROM profiles 
                WHERE role = 'doctor'
            )
        );
    END IF;

    -- Add policies for videos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'videos' 
        AND policyname = 'Videos are viewable by everyone'
    ) THEN
        CREATE POLICY "Videos are viewable by everyone" ON public.videos
        FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'videos' 
        AND policyname = 'Videos can be created by doctors'
    ) THEN
        CREATE POLICY "Videos can be created by doctors" ON public.videos
        FOR INSERT WITH CHECK (
            auth.uid() IN (
                SELECT id FROM profiles 
                WHERE role = 'doctor'
            )
        );
    END IF;

    -- Add policies for shorts
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'shorts' 
        AND policyname = 'Shorts are viewable by everyone'
    ) THEN
        CREATE POLICY "Shorts are viewable by everyone" ON public.shorts
        FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'shorts' 
        AND policyname = 'Shorts can be created by doctors'
    ) THEN
        CREATE POLICY "Shorts can be created by doctors" ON public.shorts
        FOR INSERT WITH CHECK (
            auth.uid() IN (
                SELECT id FROM profiles 
                WHERE role = 'doctor'
            )
        );
    END IF;
END
$$;

-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    content text NOT NULL,
    author_id uuid REFERENCES auth.users NOT NULL,
    created_at timestamptz DEFAULT now(),
    is_anonymous boolean DEFAULT false NOT NULL
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can update their own posts" ON public.posts
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts" ON public.posts
    FOR DELETE USING (auth.uid() = author_id);

-- Function to handle both new users and logins
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      SPLIT_PART(COALESCE(NEW.email, NEW.id::text), '@', 1)
    ),
    NULL,
    (COALESCE(NEW.raw_user_meta_data->>'role', 'user'))::public.user_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger for auth state changes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users  -- Added UPDATE to catch logins
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add function to ensure profile exists on login
CREATE OR REPLACE FUNCTION public.ensure_profile_exists()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, role)
  SELECT 
    auth.uid(),
    SPLIT_PART(COALESCE(current_setting('request.jwt.claim.email', true), auth.uid()::text), '@', 1),
    NULL,
    'user'::public.user_role
  WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle profile creation after successful authentication
CREATE OR REPLACE FUNCTION public.handle_auth_user()
RETURNS void AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, role)
  VALUES (
    auth.uid(),
    SPLIT_PART(COALESCE(current_setting('request.jwt.claim.email', true), auth.uid()::text), '@', 1),
    NULL,
    'user'::public.user_role
  )
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace the trigger function for auth events
CREATE OR REPLACE FUNCTION public.handle_auth_event()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.id IS DISTINCT FROM NEW.id) THEN
    PERFORM public.handle_auth_user();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for better performance
CREATE INDEX videos_created_at_idx ON public.videos (created_at DESC);
CREATE INDEX shorts_created_at_idx ON public.shorts (created_at DESC);
CREATE INDEX videos_author_id_idx ON public.videos (author_id);
CREATE INDEX shorts_author_id_idx ON public.shorts (author_id);