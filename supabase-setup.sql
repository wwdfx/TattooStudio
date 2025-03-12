-- V.SHAI TATTOO - Supabase Setup SQL
-- Run this script in the Supabase SQL Editor to create the necessary functions for database initialization

-- Function to create clients table
CREATE OR REPLACE FUNCTION create_clients_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create clients table if it doesn't exist
  CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Set up Row Level Security
  ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
  
  -- Create policies
  DROP POLICY IF EXISTS "Allow public read access" ON clients;
  CREATE POLICY "Allow public read access" ON clients FOR SELECT USING (true);
  
  DROP POLICY IF EXISTS "Allow authenticated insert access" ON clients;
  CREATE POLICY "Allow authenticated insert access" ON clients FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  
  DROP POLICY IF EXISTS "Allow individual update access" ON clients;
  CREATE POLICY "Allow individual update access" ON clients FOR UPDATE USING (auth.uid()::text = id::text);
  
  DROP POLICY IF EXISTS "Allow individual delete access" ON clients;
  CREATE POLICY "Allow individual delete access" ON clients FOR DELETE USING (auth.uid()::text = id::text);
END;
$$;

-- Function to create artists table
CREATE OR REPLACE FUNCTION create_artists_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create artists table if it doesn't exist
  CREATE TABLE IF NOT EXISTS artists (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    specialty TEXT,
    bio TEXT,
    profile_image TEXT,
    active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    instagram TEXT,
    facebook TEXT,
    twitter TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Set up Row Level Security
  ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
  
  -- Create policies
  DROP POLICY IF EXISTS "Allow public read access" ON artists;
  CREATE POLICY "Allow public read access" ON artists FOR SELECT USING (true);
  
  DROP POLICY IF EXISTS "Allow admin insert access" ON artists;
  CREATE POLICY "Allow admin insert access" ON artists FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.email()
    )
  );
  
  DROP POLICY IF EXISTS "Allow admin update access" ON artists;
  CREATE POLICY "Allow admin update access" ON artists FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.email()
    )
  );
  
  DROP POLICY IF EXISTS "Allow admin delete access" ON artists;
  CREATE POLICY "Allow admin delete access" ON artists FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.email()
    )
  );
END;
$$;

-- Function to create appointments table
CREATE OR REPLACE FUNCTION create_appointments_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create appointments table if it doesn't exist
  CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    reference TEXT UNIQUE NOT NULL,
    artist_id INTEGER REFERENCES artists(id),
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT,
    service TEXT NOT NULL,
    custom_description TEXT,
    date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    tattoo_description TEXT,
    is_first_tattoo BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id)
  );
  
  -- Set up Row Level Security
  ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
  
  -- Create policies
  DROP POLICY IF EXISTS "Allow public insert access" ON appointments;
  CREATE POLICY "Allow public insert access" ON appointments FOR INSERT WITH CHECK (true);
  
  DROP POLICY IF EXISTS "Allow individual read access" ON appointments;
  CREATE POLICY "Allow individual read access" ON appointments FOR SELECT USING (
    auth.uid()::text = user_id::text OR 
    client_email = auth.email() OR
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.email()
    )
  );
  
  DROP POLICY IF EXISTS "Allow individual update access" ON appointments;
  CREATE POLICY "Allow individual update access" ON appointments FOR UPDATE USING (
    auth.uid()::text = user_id::text OR 
    client_email = auth.email() OR
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.email()
    )
  );
  
  DROP POLICY IF EXISTS "Allow admin delete access" ON appointments;
  CREATE POLICY "Allow admin delete access" ON appointments FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.email()
    )
  );
END;
$$;

-- Function to create portfolio_items table
CREATE OR REPLACE FUNCTION create_portfolio_items_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create portfolio_items table if it doesn't exist
  CREATE TABLE IF NOT EXISTS portfolio_items (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    style TEXT,
    artist_id INTEGER REFERENCES artists(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Set up Row Level Security
  ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
  
  -- Create policies
  DROP POLICY IF EXISTS "Allow public read access" ON portfolio_items;
  CREATE POLICY "Allow public read access" ON portfolio_items FOR SELECT USING (true);
  
  DROP POLICY IF EXISTS "Allow admin insert access" ON portfolio_items;
  CREATE POLICY "Allow admin insert access" ON portfolio_items FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.email()
    )
  );
  
  DROP POLICY IF EXISTS "Allow admin update access" ON portfolio_items;
  CREATE POLICY "Allow admin update access" ON portfolio_items FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.email()
    )
  );
  
  DROP POLICY IF EXISTS "Allow admin delete access" ON portfolio_items;
  CREATE POLICY "Allow admin delete access" ON portfolio_items FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.email()
    )
  );
END;
$$;

-- Function to create admin_users table
CREATE OR REPLACE FUNCTION create_admin_users_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create admin_users table if it doesn't exist
  CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Set up Row Level Security
  ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
  
  -- Create policies
  DROP POLICY IF EXISTS "Allow admin read access" ON admin_users;
  CREATE POLICY "Allow admin read access" ON admin_users FOR SELECT USING (
    auth.email() = email OR
    EXISTS (
      SELECT 1 FROM admin_users AS au
      WHERE au.email = auth.email()
    )
  );
  
  DROP POLICY IF EXISTS "Allow admin insert access" ON admin_users;
  CREATE POLICY "Allow admin insert access" ON admin_users FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.email() AND
      admin_users.role = 'super_admin'
    )
  );
  
  DROP POLICY IF EXISTS "Allow admin update access" ON admin_users;
  CREATE POLICY "Allow admin update access" ON admin_users FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.email() AND
      admin_users.role = 'super_admin'
    )
  );
  
  DROP POLICY IF EXISTS "Allow admin delete access" ON admin_users;
  CREATE POLICY "Allow admin delete access" ON admin_users FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.email() AND
      admin_users.role = 'super_admin'
    )
  );
END;
$$;

-- Function to create additional tables
CREATE OR REPLACE FUNCTION create_additional_tables()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create testimonials table
  CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    client_name TEXT NOT NULL,
    client_image TEXT,
    text TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Set up Row Level Security for testimonials
  ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
  
  -- Create policies for testimonials
  DROP POLICY IF EXISTS "Allow public read access" ON testimonials;
  CREATE POLICY "Allow public read access" ON testimonials FOR SELECT USING (approved = true);
  
  DROP POLICY IF EXISTS "Allow admin read all access" ON testimonials;
  CREATE POLICY "Allow admin read all access" ON testimonials FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.email()
    )
  );
  
  DROP POLICY IF EXISTS "Allow public insert access" ON testimonials;
  CREATE POLICY "Allow public insert access" ON testimonials FOR INSERT WITH CHECK (true);
  
  DROP POLICY IF EXISTS "Allow admin update access" ON testimonials;
  CREATE POLICY "Allow admin update access" ON testimonials FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.email()
    )
  );
  
  DROP POLICY IF EXISTS "Allow admin delete access" ON testimonials;
  CREATE POLICY "Allow admin delete access" ON testimonials FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.email()
    )
  );
  
  -- Create contact_messages table
  CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Set up Row Level Security for contact_messages
  ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
  
  -- Create policies for contact_messages
  DROP POLICY IF EXISTS "Allow public insert access" ON contact_messages;
  CREATE POLICY "Allow public insert access" ON contact_messages FOR INSERT WITH CHECK (true);
  
  DROP POLICY IF EXISTS "Allow admin read access" ON contact_messages;
  CREATE POLICY "Allow admin read access" ON contact_messages FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.email()
    )
  );
  
  DROP POLICY IF EXISTS "Allow admin update access" ON contact_messages;
  CREATE POLICY "Allow admin update access" ON contact_messages FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.email()
    )
  );
  
  DROP POLICY IF EXISTS "Allow admin delete access" ON contact_messages;
  CREATE POLICY "Allow admin delete access" ON contact_messages FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.email()
    )
  );
  
  -- Create newsletter_subscribers table
  CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE
  );
  
  -- Set up Row Level Security for newsletter_subscribers
  ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
  
  -- Create policies for newsletter_subscribers
  DROP POLICY IF EXISTS "Allow public insert access" ON newsletter_subscribers;
  CREATE POLICY "Allow public insert access" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
  
  DROP POLICY IF EXISTS "Allow admin read access" ON newsletter_subscribers;
  CREATE POLICY "Allow admin read access" ON newsletter_subscribers FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.email()
    )
  );
  
  DROP POLICY IF EXISTS "Allow admin update access" ON newsletter_subscribers;
  CREATE POLICY "Allow admin update access" ON newsletter_subscribers FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.email()
    )
  );
  
  DROP POLICY IF EXISTS "Allow admin delete access" ON newsletter_subscribers;
  CREATE POLICY "Allow admin delete access" ON newsletter_subscribers FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.email()
    )
  );
END;
$$;

-- Function to add sample artists
CREATE OR REPLACE FUNCTION add_sample_artists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Add sample artists
  INSERT INTO artists (name, specialty, bio, profile_image, active, featured, instagram, facebook, twitter)
  VALUES
    ('Alex Johnson', 'Traditional', 'Specializing in bold, traditional American tattoos with a modern twist. Over 10 years of experience.', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', true, true, 'https://instagram.com/alexjohnson', 'https://facebook.com/alexjohnson', 'https://twitter.com/alexjohnson'),
    
    ('Samantha Lee', 'Watercolor', 'Creating vibrant, flowing watercolor tattoos that capture the essence of art in motion. Known for her delicate touch and eye for color.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', true, true, 'https://instagram.com/samanthalee', 'https://facebook.com/samanthalee', null),
    
    ('Marcus Chen', 'Geometric', 'Precision is key in Marcus''s geometric and dotwork designs. His background in architecture influences his unique approach to body art.', 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', true, true, 'https://instagram.com/marcuschen', null, 'https://twitter.com/marcuschen'),
    
    ('Olivia Rodriguez', 'Neo-Traditional', 'Blending traditional techniques with contemporary styles, Olivia creates bold, colorful pieces with a distinctive flair.', 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', true, false, 'https://instagram.com/oliviarodriguez', 'https://facebook.com/oliviarodriguez', null),
    
    ('James Wilson', 'Black & Grey Realism', 'Specializing in photorealistic black and grey portraits and nature scenes. James''s attention to detail is unmatched.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', true, false, 'https://instagram.com/jameswilson', null, null);
END;
$$;

-- Function to add sample clients
CREATE OR REPLACE FUNCTION add_sample_clients()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Add sample clients
  INSERT INTO clients (email, name, phone, created_at)
  VALUES
    ('john.doe@example.com', 'John Doe', '+1 (555) 123-4567', NOW() - INTERVAL '30 days'),
    ('jane.smith@example.com', 'Jane Smith', '+1 (555) 987-6543', NOW() - INTERVAL '25 days'),
    ('michael.brown@example.com', 'Michael Brown', '+1 (555) 456-7890', NOW() - INTERVAL '20 days'),
    ('sarah.williams@example.com', 'Sarah Williams', '+1 (555) 789-0123', NOW() - INTERVAL '15 days'),
    ('david.johnson@example.com', 'David Johnson', '+1 (555) 321-6547', NOW() - INTERVAL '10 days'),
    ('emily.davis@example.com', 'Emily Davis', '+1 (555) 654-3210', NOW() - INTERVAL '5 days'),
    ('robert.miller@example.com', 'Robert Miller', '+1 (555) 234-5678', NOW() - INTERVAL '3 days'),
    ('jennifer.wilson@example.com', 'Jennifer Wilson', '+1 (555) 876-5432', NOW() - INTERVAL '1 day');
END;
$$;

-- Function to add sample portfolio items
CREATE OR REPLACE FUNCTION add_sample_portfolio_items()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Add sample portfolio items
  INSERT INTO portfolio_items (title, description, image_url, style, artist_id, created_at)
  VALUES
    ('Traditional Rose', 'Classic American traditional rose with bold lines and vibrant colors.', 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'traditional', 1, NOW() - INTERVAL '60 days'),
    
    ('Geometric Wolf', 'Wolf design created with precise geometric patterns and dotwork.', 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'geometric', 3, NOW() - INTERVAL '55 days'),
    
    ('Watercolor Hummingbird', 'Vibrant hummingbird design with flowing watercolor effects.', 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'watercolor', 2, NOW() - INTERVAL '50 days'),
    
    ('Neo-Traditional Fox', 'Colorful fox design with neo-traditional styling and bold outlines.', 'https://images.unsplash.com/photo-1531722569936-825d3dd91b15?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'neo-traditional', 4, NOW() - INTERVAL '45 days'),
    
    ('Realistic Lion Portrait', 'Highly detailed black and grey realistic lion portrait.', 'https://images.unsplash.com/photo-1534570122623-99e8378a9aa7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'realism', 5, NOW() - INTERVAL '40 days'),
    
    ('Traditional Eagle', 'Bold American traditional eagle design with classic color palette.', 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'traditional', 1, NOW() - INTERVAL '35 days'),
    
    ('Geometric Mandala', 'Intricate geometric mandala design with precise linework.', 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'geometric', 3, NOW() - INTERVAL '30 days'),
    
    ('Watercolor Abstract', 'Abstract design with vibrant watercolor splashes and minimal linework.', 'https://images.unsplash.com/photo-1547153760-18fc86324498?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'watercolor', 2, NOW() - INTERVAL '25 days'),
    
    ('Neo-Traditional Owl', 'Detailed owl design with neo-traditional elements and bold colors.', 'https://images.unsplash.com/photo-1552160793-cbae1e9dfa11?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'neo-traditional', 4, NOW() - INTERVAL '20 days'),
    
    ('Realistic Tiger Eye', 'Hyper-realistic black and grey tiger eye with incredible detail.', 'https://images.unsplash.com/photo-1508185510477-5a5c5d2fe8be?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'realism', 5, NOW() - INTERVAL '15 days'),
    
    ('Traditional Anchor', 'Classic nautical anchor design with traditional styling.', 'https://images.unsplash.com/photo-1550327149-f5aef60d38f9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'traditional', 1, NOW() - INTERVAL '10 days'),
    
    ('Geometric Mountain', 'Minimalist mountain design with geometric elements.', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'geometric', 3, NOW() - INTERVAL '5 days');
END;
$$;

-- Function to add sample appointments
CREATE OR REPLACE FUNCTION add_sample_appointments()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today DATE := CURRENT_DATE;
  tomorrow DATE := CURRENT_DATE + INTERVAL '1 day';
  next_week DATE := CURRENT_DATE + INTERVAL '7 days';
  last_week DATE := CURRENT_DATE - INTERVAL '7 days';
BEGIN
  -- Add sample appointments
  INSERT INTO appointments (reference, artist_id, client_name, client_email, client_phone, service, date, time_slot, tattoo_description, status, created_at)
  VALUES
    ('APT' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 6, '0'), 1, 'John Doe', 'john.doe@example.com', '+1 (555) 123-4567', 'small', today, '14:00', 'Small traditional rose on forearm', 'confirmed', NOW() - INTERVAL '30 days'),
    
    ('APT' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 6, '0'), 2, 'Jane Smith', 'jane.smith@example.com', '+1 (555) 987-6543', 'medium', tomorrow, '11:00', 'Watercolor bird on shoulder', 'confirmed', NOW() - INTERVAL '25 days'),
    
    ('APT' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 6, '0'), 3, 'Michael Brown', 'michael.brown@example.com', '+1 (555) 456-7890', 'large', next_week, '13:00', 'Geometric sleeve design', 'confirmed', NOW() - INTERVAL '20 days'),
    
    ('APT' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 6, '0'), 4, 'Sarah Williams', 'sarah.williams@example.com', '+1 (555) 789-0123', 'consultation', today, '16:00', 'Consultation for back piece', 'confirmed', NOW() - INTERVAL '15 days'),
    
    ('APT' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 6, '0'), 5, 'David Johnson', 'david.johnson@example.com', '+1 (555) 321-6547', 'custom', next_week, '10:00', 'Custom portrait of family member', 'confirmed', NOW() - INTERVAL '10 days'),
    
    ('APT' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 6, '0'), 1, 'Emily Davis', 'emily.davis@example.com', '+1 (555) 654-3210', 'small', last_week, '15:00', 'Small heart on wrist', 'completed', NOW() - INTERVAL '15 days'),
    
    ('APT' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 6, '0'), 2, 'Robert Miller', 'robert.miller@example.com', '+1 (555) 234-5678', 'medium', last_week, '12:00', 'Watercolor landscape on calf', 'completed', NOW() - INTERVAL '20 days'),
    
    ('APT' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 6, '0'), 3, 'Jennifer Wilson', 'jennifer.wilson@example.com', '+1 (555) 876-5432', 'consultation', last_week, '14:00', 'Consultation for geometric design', 'cancelled', NOW() - INTERVAL '25 days');
END;
$$;

-- Function to add admin user
CREATE OR REPLACE FUNCTION add_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Add admin user
  INSERT INTO admin_users (email, name, role)
  VALUES ('admin@vshai.tattoo', 'Admin User', 'super_admin');
END;
$$;

-- Function to get monthly revenue
CREATE OR REPLACE FUNCTION get_monthly_revenue()
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_revenue numeric;
BEGIN
  SELECT COALESCE(SUM(
    CASE
      WHEN service = 'small' THEN 100
      WHEN service = 'medium' THEN 200
      WHEN service = 'large' THEN 350
      WHEN service = 'custom' THEN 500
      ELSE 0
    END
  ), 0) INTO total_revenue
  FROM appointments
  WHERE 
    date >= date_trunc('month', CURRENT_DATE) AND
    date < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month' AND
    status IN ('confirmed', 'completed');
  
  RETURN total_revenue;
END;
$$;

-- Function to get artist performance
CREATE OR REPLACE FUNCTION get_artist_performance()
RETURNS TABLE (
  artist_id integer,
  artist_name text,
  appointment_count bigint,
  revenue numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id as artist_id,
    a.name as artist_name,
    COUNT(ap.id) as appointment_count,
    COALESCE(SUM(
      CASE
        WHEN ap.service = 'small' THEN 100
        WHEN ap.service = 'medium' THEN 200
        WHEN ap.service = 'large' THEN 350
        WHEN ap.service = 'custom' THEN 500
        ELSE 0
      END
    ), 0) as revenue
  FROM 
    artists a
    LEFT JOIN appointments ap ON a.id = ap.artist_id AND ap.status IN ('confirmed', 'completed')
  GROUP BY 
    a.id, a.name
  ORDER BY 
    revenue DESC;
END;
$$;
