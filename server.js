const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const CSV_FILE = path.join(__dirname, 'users.csv');

app.use(cors());
app.use(express.json());

// Create CSV file with headers if it doesn't exist
if (!fs.existsSync(CSV_FILE)) {
    fs.writeFileSync(CSV_FILE, 'username,password,role\n');
}

// Utility function to read users from CSV
const getUsers = () => {
    const data = fs.readFileSync(CSV_FILE, 'utf8');
    const lines = data.trim().split('\n');
    const users = [];
    for (let i = 1; i < lines.length; i++) {
        const [username, password, role] = lines[i].split(',');
        if (username) users.push({ username, password, role });
    }
    return users;
};

// 1. SIGNUP ENDPOINT
app.post('/signup', (req, res) => {
    const { username, password, role } = req.body;
    const users = getUsers();

    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: 'Username already exists!' });
    }

    // Append to CSV
    fs.appendFileSync(CSV_FILE, `${username},${password},${role}\n`);
    res.json({ message: `Signup successful! Role: ${role}` });
});

// 2. LOGIN ENDPOINT
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        res.json({ message: `Welcome back, ${user.role} ${username}!` });
    } else {
        res.status(401).json({ message: 'Invalid username or password.' });
    }
});

// 3. FORGOT PASSWORD ENDPOINT
app.post('/forgot', (req, res) => {
    const { username } = req.body;
    const users = getUsers();
    const user = users.find(u => u.username === username);

    if (user) {
        // Recalling data from CSV
        res.json({ message: `Your password is: ${user.password}` });
    } else {
        res.status(404).json({ message: 'User not found.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});