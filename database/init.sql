-- Database initialization script for Indian Navy Question Bank
-- This script will be automatically executed when the PostgreSQL container starts

-- Create the questions table
CREATE TABLE IF NOT EXISTS questions (
    question_id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    language VARCHAR(50) DEFAULT 'English',
    image_required BOOLEAN DEFAULT FALSE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('MCQ', 'Short Answer', 'Long Answer', 'oneword', 'True/False')),
    solution TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the tags table
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL,
    tag VARCHAR(100) NOT NULL,
    FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE,
    UNIQUE(question_id, tag)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_language ON questions(language);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at);
CREATE INDEX IF NOT EXISTS idx_tags_question_id ON tags(question_id);
CREATE INDEX IF NOT EXISTS idx_tags_tag ON tags(tag);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at timestamp
DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;
CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing (optional)
INSERT INTO questions (question, difficulty, language, image_required, type, solution) VALUES
('What is the capital of India?', 'Easy', 'English', FALSE, 'MCQ', 'New Delhi'),
('Explain the principle of buoyancy.', 'Medium', 'English', FALSE, 'Short Answer', 'Buoyancy is the upward force exerted by a fluid on an object immersed in it.'),
('Describe the working of a submarine periscope in detail.', 'Hard', 'English', TRUE, 'Long Answer', 'A periscope uses a series of mirrors and lenses to allow observation from a concealed position.')
ON CONFLICT DO NOTHING;

-- Insert sample tags
INSERT INTO tags (question_id, tag) VALUES
(1, 'geography'),
(1, 'india'),
(1, 'capitals'),
(2, 'physics'),
(2, 'fluid mechanics'),
(2, 'naval science'),
(3, 'submarine'),
(3, 'periscope'),
(3, 'naval equipment')
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Print completion message
DO $$
BEGIN
    RAISE NOTICE 'Database schema initialized successfully!';
    RAISE NOTICE 'Sample data inserted for testing.';
END $$;
