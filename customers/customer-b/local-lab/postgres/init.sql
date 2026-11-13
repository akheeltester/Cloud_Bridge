CREATE TABLE IF NOT EXISTS employees (
    employee_id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(80) NOT NULL,
    role VARCHAR(100) NOT NULL,
    employment_status VARCHAR(30) NOT NULL DEFAULT 'active'
);

INSERT INTO employees
    (employee_id, name, department, role, employment_status)
VALUES
    (1001, 'Alex Morgan', 'Management', 'Operations Director', 'active'),
    (1002, 'Jordan Lee', 'IT Infrastructure', 'Systems Administrator', 'active'),
    (1003, 'Taylor Reed', 'IT Infrastructure', 'Network Engineer', 'active'),
    (1004, 'Casey Brown', 'Software Development', 'Backend Developer', 'active'),
    (1005, 'Riley Carter', 'Software Development', 'Frontend Developer', 'active'),
    (1006, 'Morgan Ellis', 'Database Operations', 'Database Administrator', 'active'),
    (1007, 'Jamie Parker', 'Cybersecurity', 'Security Analyst', 'active'),
    (1008, 'Avery Brooks', 'Sales', 'Account Executive', 'active'),
    (1009, 'Drew Bennett', 'Customer Support', 'Support Specialist', 'active'),
    (1010, 'Quinn Foster', 'HR and Finance', 'HR Coordinator', 'active')
ON CONFLICT (employee_id) DO NOTHING;
