/*
  # Initial Schema for Quiz Application

  1. New Tables
    - users (managed by Supabase Auth)
    - quizzes
      - id (uuid, primary key)
      - title (text)
      - description (text)
      - is_public (boolean)
      - created_at (timestamp)
      - user_id (uuid, foreign key)
    - questions
      - id (uuid, primary key)
      - quiz_id (uuid, foreign key)
      - question_text (text)
      - options (jsonb)
      - correct_answer (text)
      - order (integer)
    
  2. Security
    - Enable RLS on all tables
    - Add policies for:
      - Public quiz access
      - User's own quiz access
      - Question access based on quiz visibility
*/

CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  question_text text NOT NULL,
  options jsonb NOT NULL,
  correct_answer text NOT NULL,
  "order" integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Policies for quizzes
CREATE POLICY "Public quizzes are viewable by everyone"
  ON quizzes
  FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can manage their own quizzes"
  ON quizzes
  USING (auth.uid() = user_id);

-- Policies for questions
CREATE POLICY "Questions are viewable if quiz is public"
  ON questions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = questions.quiz_id
      AND (quizzes.is_public = true OR quizzes.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage questions in their quizzes"
  ON questions
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = questions.quiz_id
      AND quizzes.user_id = auth.uid()
    )
  );
