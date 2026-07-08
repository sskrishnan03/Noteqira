/*
# CogniNote AI - Enable Anon Access (No Authentication)

1. Changes
- Update all RLS policies to allow anon access alongside authenticated
- This enables the app to work without any login/signup
- All user_id columns still exist but will use anon fallbacks

2. Security
- All tables accessible to anon + authenticated roles
- No ownership checks since no auth required
*/

-- Update notes policies for anon access
DROP POLICY IF EXISTS "Users can view own notes" ON notes;
CREATE POLICY "anon_select_notes" ON notes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Users can create notes" ON notes;
CREATE POLICY "anon_insert_notes" ON notes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own notes" ON notes;
CREATE POLICY "anon_update_notes" ON notes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete own notes" ON notes;
CREATE POLICY "anon_delete_notes" ON notes FOR DELETE
  TO anon, authenticated USING (true);

-- Update notebooks policies
DROP POLICY IF EXISTS "Users can view own notebooks" ON notebooks;
CREATE POLICY "anon_select_notebooks" ON notebooks FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Users can create notebooks" ON notebooks;
CREATE POLICY "anon_insert_notebooks" ON notebooks FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own notebooks" ON notebooks;
CREATE POLICY "anon_update_notebooks" ON notebooks FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete own notebooks" ON notebooks;
CREATE POLICY "anon_delete_notebooks" ON notebooks FOR DELETE
  TO anon, authenticated USING (true);

-- Update tags policies
DROP POLICY IF EXISTS "Users can view own tags" ON tags;
CREATE POLICY "anon_select_tags" ON tags FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Users can create tags" ON tags;
CREATE POLICY "anon_insert_tags" ON tags FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own tags" ON tags;
CREATE POLICY "anon_update_tags" ON tags FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete own tags" ON tags;
CREATE POLICY "anon_delete_tags" ON tags FOR DELETE
  TO anon, authenticated USING (true);

-- Update note_tags policies
DROP POLICY IF EXISTS "Users can view note tags" ON note_tags;
CREATE POLICY "anon_select_note_tags" ON note_tags FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Users can create note tags" ON note_tags;
CREATE POLICY "anon_insert_note_tags" ON note_tags FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete note tags" ON note_tags;
CREATE POLICY "anon_delete_note_tags" ON note_tags FOR DELETE
  TO anon, authenticated USING (true);

-- Update flashcards policies
DROP POLICY IF EXISTS "Users can view own flashcards" ON flashcards;
CREATE POLICY "anon_select_flashcards" ON flashcards FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Users can create flashcards" ON flashcards;
CREATE POLICY "anon_insert_flashcards" ON flashcards FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own flashcards" ON flashcards;
CREATE POLICY "anon_update_flashcards" ON flashcards FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete own flashcards" ON flashcards;
CREATE POLICY "anon_delete_flashcards" ON flashcards FOR DELETE
  TO anon, authenticated USING (true);

-- Update quizzes policies
DROP POLICY IF EXISTS "Users can view own quizzes" ON quizzes;
CREATE POLICY "anon_select_quizzes" ON quizzes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Users can create quizzes" ON quizzes;
CREATE POLICY "anon_insert_quizzes" ON quizzes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own quizzes" ON quizzes;
CREATE POLICY "anon_update_quizzes" ON quizzes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete own quizzes" ON quizzes;
CREATE POLICY "anon_delete_quizzes" ON quizzes FOR DELETE
  TO anon, authenticated USING (true);

-- Update reminders policies
DROP POLICY IF EXISTS "Users can view own reminders" ON reminders;
CREATE POLICY "anon_select_reminders" ON reminders FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Users can create reminders" ON reminders;
CREATE POLICY "anon_insert_reminders" ON reminders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own reminders" ON reminders;
CREATE POLICY "anon_update_reminders" ON reminders FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete own reminders" ON reminders;
CREATE POLICY "anon_delete_reminders" ON reminders FOR DELETE
  TO anon, authenticated USING (true);

-- Update activity_log policies
DROP POLICY IF EXISTS "Users can view own activity" ON activity_log;
CREATE POLICY "anon_select_activity" ON activity_log FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Users can log activity" ON activity_log;
CREATE POLICY "anon_insert_activity" ON activity_log FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Update collaborators policies
DROP POLICY IF EXISTS "Users can view collaborators" ON collaborators;
CREATE POLICY "anon_select_collaborators" ON collaborators FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Users can create collaborators" ON collaborators;
CREATE POLICY "anon_insert_collaborators" ON collaborators FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete collaborators" ON collaborators;
CREATE POLICY "anon_delete_collaborators" ON collaborators FOR DELETE
  TO anon, authenticated USING (true);

-- Update profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "anon_select_profiles" ON profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Users can create profile" ON profiles;
CREATE POLICY "anon_insert_profiles" ON profiles FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "anon_update_profiles" ON profiles FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);