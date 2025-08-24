-- password = 'admin123' (will re-hash in Node, but for demo we can just seed hashed password later)
INSERT INTO users (name, email, password, is_admin)
VALUES 
  ('Admin User', 'admin@example.com', '$2b$10$5a3C0u5yQoG4f9eZAnYxzehKkjP5Bmcdo4XwGxYcQkG7h.yxUb6em', TRUE),
  ('Normal User', 'user@example.com', '$2b$10$5a3C0u5yQoG4f9eZAnYxzehKkjP5Bmcdo4XwGxYcQkG7h.yxUb6em', FALSE);
