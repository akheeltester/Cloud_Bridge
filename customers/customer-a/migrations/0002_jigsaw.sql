-- Jigsaw company directory, documents, and public site records.
-- Directory rows are company records, not login accounts. No passwords here.

create table if not exists departments (
  id text primary key,
  name text not null unique,
  code text not null unique,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists employees (
  id text primary key,
  user_id text unique,
  email text not null unique,
  full_name text not null,
  title text not null,
  department_id text not null references departments (id),
  manager_id text references employees (id),
  role text not null check (role in ('employee', 'manager', 'hr')),
  phone text not null default '',
  location text not null default '',
  bio text not null default '',
  start_date date not null default current_date,
  status text not null default 'active' check (status in ('active', 'leave', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists employees_department_idx on employees (department_id);
create index if not exists employees_manager_idx on employees (manager_id);

create table if not exists documents (
  id text primary key,
  owner_employee_id text not null references employees (id),
  department_id text references departments (id),
  title text not null,
  filename text not null,
  mime text not null,
  size_bytes integer not null,
  content_base64 text not null,
  visibility text not null check (visibility in ('private', 'team', 'company')),
  uploaded_by_user_id text not null,
  created_at timestamptz not null default now()
);

create index if not exists documents_owner_idx on documents (owner_employee_id);

create table if not exists audit_logs (
  id bigserial primary key,
  actor_user_id text not null,
  action text not null,
  entity text not null,
  entity_id text,
  detail text not null,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_created_idx on audit_logs (created_at desc);

create table if not exists job_posts (
  id text primary key,
  title text not null,
  department_id text not null references departments (id),
  location text not null,
  employment_type text not null,
  summary text not null,
  posted_at date not null default current_date
);

create table if not exists contact_messages (
  id bigserial primary key,
  name text not null,
  email text not null,
  company text not null default '',
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists rate_events (
  id bigserial primary key,
  bucket text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_events_bucket_idx on rate_events (bucket, created_at);

insert into departments (id, name, code, description) values
  ('dep_people', 'People', 'PPL', 'Hiring, employee records, and the rules everyone else relies on.'),
  ('dep_engineering', 'Engineering', 'ENG', 'The portal, the integrations, and the systems clients actually log into.'),
  ('dep_studio', 'Studio', 'STU', 'Identity, interface, and the way a company presents itself.'),
  ('dep_delivery', 'Delivery', 'DLV', 'Client engagements: org design, rollout, and the first ninety days.'),
  ('dep_finance', 'Finance', 'FIN', 'Billing, payroll support, and the numbers behind a studio.')
on conflict (id) do nothing;

insert into employees (
  id, email, full_name, title, department_id, manager_id, role, phone, location, bio, start_date, status
) values
  ('emp_maya', 'maya.chen@jigsaw.example', 'Maya Chen', 'Chief People Officer', 'dep_people', null, 'hr', '+1 312 555 0148', 'Chicago', 'Keeps the directory honest and the access rules shorter than the exceptions.', '2016-04-11', 'active'),
  ('emp_jonas', 'jonas.reed@jigsaw.example', 'Jonas Reed', 'VP Engineering', 'dep_engineering', null, 'manager', '+351 21 555 0190', 'Lisbon', 'Ships the employee portal and refuses shared logins.', '2017-01-09', 'active'),
  ('emp_priya', 'priya.nair@jigsaw.example', 'Priya Nair', 'Design Director', 'dep_studio', null, 'manager', '+351 21 555 0114', 'Lisbon', 'Treats the company site and the product as one voice.', '2017-06-20', 'active'),
  ('emp_elena', 'elena.voss@jigsaw.example', 'Elena Voss', 'Delivery Lead', 'dep_delivery', null, 'manager', '+65 6555 0172', 'Singapore', 'Runs client rollouts from the first workshop to the first live directory.', '2018-02-05', 'active'),
  ('emp_samir', 'samir.adeyemi@jigsaw.example', 'Samir Adeyemi', 'Finance Partner', 'dep_finance', null, 'manager', '+1 312 555 0166', 'Chicago', 'Closes the books without turning the company into a spreadsheet.', '2018-09-17', 'active'),
  ('emp_hugo', 'hugo.martins@jigsaw.example', 'Hugo Martins', 'Senior Engineer', 'dep_engineering', 'emp_jonas', 'employee', '+351 21 555 0133', 'Lisbon', 'Owns directory search and the permission checks behind it.', '2019-03-04', 'active'),
  ('emp_amina', 'amina.diallo@jigsaw.example', 'Amina Diallo', 'Engineer', 'dep_engineering', 'emp_jonas', 'employee', '+351 21 555 0188', 'Lisbon', 'Builds the document room and the upload limits that keep it boring.', '2021-11-15', 'active'),
  ('emp_noah', 'noah.berg@jigsaw.example', 'Noah Berg', 'Platform Engineer', 'dep_engineering', 'emp_jonas', 'employee', '+1 312 555 0102', 'Chicago', 'On leave this month, still on the on-call rota for incidents only.', '2020-08-24', 'leave'),
  ('emp_ines', 'ines.costa@jigsaw.example', 'Ines Costa', 'Brand Designer', 'dep_studio', 'emp_priya', 'employee', '+351 21 555 0127', 'Lisbon', 'Draws the mark, the type, and the quiet parts of the marketing site.', '2022-01-10', 'active'),
  ('emp_theo', 'theo.park@jigsaw.example', 'Theo Park', 'Product Designer', 'dep_studio', 'emp_priya', 'employee', '+65 6555 0194', 'Singapore', 'Designs the portal so a manager can see a team without seeing payroll.', '2022-05-02', 'active'),
  ('emp_clara', 'clara.mendes@jigsaw.example', 'Clara Mendes', 'Consultant', 'dep_delivery', 'emp_elena', 'employee', '+65 6555 0151', 'Singapore', 'Sits with client HR teams until their directory matches how they actually work.', '2023-04-18', 'active'),
  ('emp_owen', 'owen.blake@jigsaw.example', 'Owen Blake', 'Accountant', 'dep_finance', 'emp_samir', 'employee', '+1 312 555 0177', 'Chicago', 'Keeps finance files private and the month-end calendar public.', '2023-09-01', 'active')
on conflict (id) do nothing;

insert into documents (
  id, owner_employee_id, department_id, title, filename, mime, size_bytes, content_base64, visibility, uploaded_by_user_id
) values
  (
    'doc_handbook', 'emp_maya', 'dep_people', 'Studio handbook', 'studio-handbook.txt', 'text/plain', 174,
    'Smlnc2F3IHN0dWRpbyBoYW5kYm9vawoKUm9sZXMgYXJlIGNoZWNrZWQgb24gdGhlIHNlcnZlci4gQSBoaWRkZW4gYnV0dG9uIGlzIG5vdCBhIHBlcm1pc3Npb24uCkRvY3VtZW50cyBzdGF5IGluIHRoZSBjb21wYW55IHJvb20uIEEgc2hhcmVkIGRyaXZlIGlzIG5vdCB0aGUgc3lzdGVtIG9mIHJlY29yZC4K',
    'company', 'seed'
  ),
  (
    'doc_onboard', 'emp_jonas', 'dep_engineering', 'Engineering onboarding', 'engineering-onboarding.txt', 'text/plain', 141,
    'RW5naW5lZXJpbmcgb25ib2FyZGluZwoKTGlzYm9uIHN0dWRpby4gQWNjb3VudHMgYXJlIHBlcnNvbmFsLiBEbyBub3Qgc2hhcmUgYSBwYXNzd29yZC4KQXNrIFBlb3BsZSBvcGVyYXRpb25zIGJlZm9yZSBleHBvcnRpbmcgdGhlIGRpcmVjdG9yeS4K',
    'team', 'seed'
  ),
  (
    'doc_notes', 'emp_owen', 'dep_finance', 'Finance desk notes', 'finance-desk-notes.txt', 'text/plain', 87,
    'RmluYW5jZSBkZXNrIG5vdGVzCgpSZWltYnVyc2VtZW50IGNvZGVzIHN0YXkgaW5zaWRlIEZpbmFuY2UuIERvIG5vdCBmb3J3YXJkIHRoaXMgZmlsZS4K',
    'private', 'seed'
  )
on conflict (id) do nothing;

insert into job_posts (id, title, department_id, location, employment_type, summary, posted_at) values
  ('job_eng', 'Product engineer', 'dep_engineering', 'Lisbon', 'Full-time', 'Build the directory, permissions, and document room that Jigsaw runs for its own people and for clients.', '2026-09-02'),
  ('job_people', 'People operations partner', 'dep_people', 'Chicago', 'Full-time', 'Own employee records, onboarding, and the audit trail. You will say no to shared inboxes.', '2026-09-18'),
  ('job_delivery', 'Client delivery consultant', 'dep_delivery', 'Singapore', 'Full-time', 'Take a client from a shared drive to a role-based portal without losing the month.', '2026-10-01'),
  ('job_brand', 'Brand designer', 'dep_studio', 'Lisbon', 'Contract', 'A six-month seat on the company site, the portal chrome, and the next identity system.', '2026-10-20')
on conflict (id) do nothing;

insert into audit_logs (actor_user_id, action, entity, entity_id, detail)
select 'seed', 'import', 'employee', 'directory', 'Studio directory imported for Lisbon, Singapore, and Chicago.'
where not exists (select 1 from audit_logs where actor_user_id = 'seed' and action = 'import');
