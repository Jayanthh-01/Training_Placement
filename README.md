# Training & Placement Portal

This is a project where a college's **Training & Placement (T&P) officer** and **students**
can work together for campus placements.

- The **officer** can add companies that are coming for placement and track who applied.
- A **student** can see those companies, apply to them, and check their application status.

Right now, the **backend** (the part that stores data and handles the logic) is ready.
The screens/pages (frontend) are still being built.

---

## What you need before testing

Just two things:

1. **Node.js** installed on your computer — download it from https://nodejs.org
2. An internet connection (the database lives online, on Render).

That's it. No database installation needed.

---

## How to run and test it (step by step)

Follow these in order. Don't skip any.

### Step 1 — Download the project

Open a terminal and run:

```
git clone https://github.com/YOUR_USERNAME/training-placement-portal.git
cd training-placement-portal
npm install
```

The last command downloads the things the project needs. Wait for it to finish.

### Step 2 — Add the secret settings file

Create a new file called **`.env`** in the project folder, and paste these three lines
into it (ask the project owner for the real database link):

```
DATABASE_URL=(paste the database link here)
JWT_SECRET=mysecretkey123
PORT=5000
```

### Step 3 — Set up the database

This creates the tables and adds a few sample entries:

```
node setup.js
```

If it worked, you'll see a message saying the tables were created.

### Step 4 — Start the project

```
node server.js
```

You'll see: **Server running on http://localhost:5000**

Leave this window open and running.

### Step 5 — Check that it works

Open your web browser and go to:

```
http://localhost:5000/companies
```

If you see a list of companies (like Infosys and TCS), **it's working!**
The data you're seeing is coming live from the database.

---

## Want to test more (login, applying, etc.)?

Most actions need you to log in first. The easiest way to try them is with a small
ready-made test file.

Create a file called **`test.js`** in the project folder and paste this in:

```javascript
const BASE = 'http://localhost:5000';

async function run() {
  // Create an officer account
  await fetch(`${BASE}/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Officer', email: 'officer@college.edu',
      password: 'mypassword', role: 'officer'
    })
  });

  // Log in
  let res = await fetch(`${BASE}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'officer@college.edu', password: 'mypassword' })
  });
  const data = await res.json();
  console.log('Logged in:', data.token ? 'YES' : 'NO');

  const auth = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${data.token}` };

  // Add a company
  res = await fetch(`${BASE}/companies`, {
    method: 'POST', headers: auth,
    body: JSON.stringify({ name: 'Wipro', role_offered: 'Engineer', package: 5.5 })
  });
  console.log('Added company:', await res.json());

  // See the list of students
  console.log('Students:', await (await fetch(`${BASE}/students`, { headers: auth })).json());
}

run();
```

Then, in a **second** terminal window (keep the server running in the first), type:

```
node test.js
```

You should see "Logged in: YES", a new company added, and the list of students.
That means everything is working end to end.

---

## What the project can do so far

- Create accounts and log in (for both students and officers)
- Keep students and officers separate (each can only do what they're allowed to)
- Officer can add companies and see all students
- Students can apply to companies
- Both can track application status

---

## What's coming next

- The actual web pages (login screen, dashboards, company list)
- Putting the whole thing online so anyone can use it

---

## Common problems

- **"Login failed" or nothing happens?** Make sure the server is running, and that you
  restarted it after creating the `.env` file.
- **Can't connect to the database?** Double-check the `DATABASE_URL` line in your `.env`
  is correct and on a single line.
- **A command "isn't recognized"?** Make sure Node.js is installed (run `node -v` to check).
