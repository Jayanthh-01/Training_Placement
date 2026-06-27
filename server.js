require('dotenv').config();
const { authenticate, officerOnly } = require('./middleware');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./auth');
const pool = require('./db');   // <-- import the shared connection

const app = express();
app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);   // now /auth/register and /auth/login exist

// Test route (keep this)
app.get('/', (req, res) => {
  res.json({ message: 'T&P Portal backend is running!' });
});

// NEW: a route that reads real data from the companies table
app.get('/companies', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM companies ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

const PORT = process.env.PORT || 5000;

// ---------- COMPANIES ----------

// Officer adds a company (protected: must be logged in AND an officer)
app.post('/companies', authenticate, officerOnly, async (req, res) => {
  try {
    const { name, role_offered, package: pkg, job_description,
            eligibility_type, min_cgpa, allowed_branches, max_backlogs,
            quota_size, visit_date } = req.body;
    const result = await pool.query(
      `INSERT INTO companies
        (name, role_offered, package, job_description, eligibility_type,
         min_cgpa, allowed_branches, max_backlogs, quota_size, visit_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [name, role_offered, pkg, job_description, eligibility_type || 'rule',
       min_cgpa || 0, allowed_branches, max_backlogs || 99, quota_size, visit_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add company', detail: err.message });
  }
});

// ---------- STUDENTS ----------

// Officer views all students (protected, officer-only)
app.get('/students', authenticate, officerOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, p.cgpa, p.branch, p.backlogs
       FROM users u
       LEFT JOIN student_profiles p ON p.user_id = u.id
       WHERE u.role = 'student' ORDER BY u.id`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch students', detail: err.message });
  }
});

// ---------- APPLICATIONS ----------

// Student applies to a company (protected: any logged-in user)
app.post('/applications', authenticate, async (req, res) => {
  try {
    const { company_id } = req.body;
    const student_id = req.user.id;          // comes from the token, not the body
    const result = await pool.query(
      `INSERT INTO applications (student_id, company_id, status)
       VALUES ($1, $2, 'applied') RETURNING *`,
      [student_id, company_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505')
      return res.status(409).json({ error: 'You already applied to this company' });
    console.error(err);
    res.status(500).json({ error: 'Failed to apply', detail: err.message });
  }
});

// View applications — a student sees only their own; an officer sees all
app.get('/applications', authenticate, async (req, res) => {
  try {
    let result;
    if (req.user.role === 'officer') {
      result = await pool.query(
        `SELECT a.id, u.name AS student, c.name AS company, a.status, a.applied_at
         FROM applications a
         JOIN users u ON a.student_id = u.id
         JOIN companies c ON a.company_id = c.id
         ORDER BY a.id`
      );
    } else {
      result = await pool.query(
        `SELECT a.id, c.name AS company, a.status, a.applied_at
         FROM applications a
         JOIN companies c ON a.company_id = c.id
         WHERE a.student_id = $1 ORDER BY a.id`,
        [req.user.id]
      );
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch applications', detail: err.message });
  }
});

// Officer updates an application's status (protected, officer-only)
app.put('/applications/:id', authenticate, officerOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE applications SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Application not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update status', detail: err.message });
  }
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});