-- V5__decisions_full_text_search.sql
ALTER TABLE decisions ADD COLUMN IF NOT EXISTS view_count INT NOT NULL DEFAULT 0;
ALTER TABLE decisions ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Update the search vector trigger to include body content
CREATE OR REPLACE FUNCTION decisions_search_vector_update() RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('english',
        COALESCE(NEW.title, '') || ' ' ||
        COALESCE(NEW.body, '') || ' ' ||
        COALESCE(array_to_string(NEW.tags, ' '), '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update existing search vectors
UPDATE decisions SET 
    search_vector = to_tsvector('english',
        COALESCE(title, '') || ' ' ||
        COALESCE(body, '') || ' ' ||
        COALESCE(array_to_string(tags, ' '), '')
    );
