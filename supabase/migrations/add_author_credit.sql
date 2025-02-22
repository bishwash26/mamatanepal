-- Add author_credit column to blogs, videos, and shorts tables
ALTER TABLE blogs ADD COLUMN author_credit TEXT;
ALTER TABLE videos ADD COLUMN author_credit TEXT;
ALTER TABLE shorts ADD COLUMN author_credit TEXT; 