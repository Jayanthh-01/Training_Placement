const BASE = 'http://localhost:5000';

async function run() {
  // Log in as the officer
  let res = await fetch(`${BASE}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@college.edu', password: 'mypassword' })
  });
  const { token } = await res.json();
  console.log('Got token:', token ? 'YES' : 'NO');

  const auth = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  // Officer adds a company
  res = await fetch(`${BASE}/companies`, {
    method: 'POST', headers: auth,
    body: JSON.stringify({ name: 'Wipro', role_offered: 'Engineer', package: 5.5, eligibility_type: 'rule', min_cgpa: 6.0 })
  });
  console.log('ADD COMPANY:', await res.json());

  // Officer views students
  res = await fetch(`${BASE}/students`, { headers: auth });
  console.log('STUDENTS:', await res.json());

  // Officer views all applications
  res = await fetch(`${BASE}/applications`, { headers: auth });
  console.log('APPLICATIONS:', await res.json());
}

run();