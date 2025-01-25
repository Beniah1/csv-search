-- First drop and recreate the table
DROP TABLE IF EXISTS csv_data_january;

CREATE TABLE csv_data_january (
    id SERIAL PRIMARY KEY,
    gender VARCHAR(10),
    full_name VARCHAR(100),
    phone_number VARCHAR(20),
    attendance_5th VARCHAR(10),
    attendance_12th VARCHAR(10),
    attendance_19th VARCHAR(10),
    attendance_26th VARCHAR(10),
    age INTEGER,
    current_level VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- First drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."csv_data_january";
DROP POLICY IF EXISTS "Enable update access for all users" ON "public"."csv_data_january";
DROP POLICY IF EXISTS "Enable insert access for all users" ON "public"."csv_data_january";

-- Then add the policies
create policy "Enable read access for all users"
on "public"."csv_data_january"
for select using (true);

create policy "Enable update access for all users"
on "public"."csv_data_january"
for update using (true);

-- Enable RLS on the table
ALTER TABLE csv_data_january ENABLE ROW LEVEL SECURITY;

-- Add insert policy with WITH CHECK
create policy "Enable insert access for all users"
on "public"."csv_data_january"
for insert with check (true);
