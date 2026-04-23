const express = require('express');
const app = express();

app.use(express.json());

const users = [];
const items = [];
let itemIdCounter = 1;

app.post('/register', (req, res) => {
    const { email, password } = req.body;

    if (!email || !email.includes('@') || !password || password.length < 6) {
        return res.status(400).json({ error: "Invalid data" });
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(409).json({ error: "Conflict" });
    }

    users.push({ email, password });
    res.status(201).json({ message: "Created" });
});

app.post('/items', (req, res) => {
    const { title, year, material } = req.body;
    const currentYear = new Date().getFullYear();

    if (!title || !year || !material) {
        return res.status(400).json({ error: "Invalid data" });
    }

    if (year > currentYear) {
        return res.status(400).json({ error: "Invalid data" });
    }

    const newItem = {
        id: itemIdCounter++,
        title,
        year,
        material
    };
    
    items.push(newItem);
    res.status(201).json(newItem);
});

app.get('/items', (req, res) => {
    res.status(200).json(items);
});

app.put('/items/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { title, year, material } = req.body;
    const currentYear = new Date().getFullYear();

    const itemIndex = items.findIndex(i => i.id === id);

    if (itemIndex === -1) {
        return res.status(404).json({ error: "Not found" });
    }

    if (!title || !year || !material || year > currentYear) {
        return res.status(400).json({ error: "Invalid data" });
    }

    items[itemIndex] = { id, title, year, material };
    res.status(200).json(items[itemIndex]);
});

app.delete('/items/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const itemIndex = items.findIndex(i => i.id === id);

    if (itemIndex === -1) {
        return res.status(404).json({ error: "Not found" });
    }

    items.splice(itemIndex, 1);
    res.status(204).send();
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});