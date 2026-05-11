const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const SECRET = 'super-secret-key';
const users = [];
const items = [];
let itemIdCounter = 1;

// --- Виділена бізнес-логіка для Unit-тестів ---
const validateItem = (title, year, material) => {
    const currentYear = new Date().getFullYear();
    return !!(title && year && material && year <= currentYear); // Інваріант: час не в минулому
};

// --- Middleware для перевірки токена ---
const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" }); // Неавторизовані запити повертають 401

    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: "Unauthorized" });
        req.user = decoded;
        next();
    });
};

// --- Роути ---
app.post('/register', (req, res) => {
    const { email, password } = req.body;
    if (!email || !email.includes('@') || !password || password.length < 6) {
        return res.status(400).json({ error: "Invalid data" });
    }
    if (users.find(u => u.email === email)) {
        return res.status(409).json({ error: "Conflict" });
    }
    users.push({ email, password });
    res.status(201).json({ message: "Created" });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const token = jwt.sign({ email: user.email }, SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
});

// Захищені ендпоінти
app.post('/items', authMiddleware, (req, res) => {
    const { title, year, material } = req.body;
    if (!validateItem(title, year, material)) {
        return res.status(400).json({ error: "Invalid data" });
    }
    const newItem = { id: itemIdCounter++, title, year, material, owner: req.user.email };
    items.push(newItem);
    res.status(201).json(newItem);
});

app.get('/items', authMiddleware, (req, res) => {
    res.status(200).json(items.filter(i => i.owner === req.user.email));
});

app.put('/items/:id', authMiddleware, (req, res) => {
    const { title, year, material } = req.body;
    const itemId = parseInt(req.params.id);
    const itemIndex = items.findIndex(i => i.id === itemId && i.owner === req.user.email);

    if (itemIndex === -1) {
        return res.status(404).json({ error: "Not Found" });
    }
    if (!validateItem(title, year, material)) {
        return res.status(400).json({ error: "Invalid data" });
    }

    items[itemIndex] = { ...items[itemIndex], title, year, material };
    res.status(200).json(items[itemIndex]);
});

app.delete('/items/:id', authMiddleware, (req, res) => {
    const itemId = parseInt(req.params.id);
    const itemIndex = items.findIndex(i => i.id === itemId && i.owner === req.user.email);

    if (itemIndex === -1) {
        return res.status(404).json({ error: "Not Found" });
    }

    items.splice(itemIndex, 1);
    res.status(204).send();
});

// Експорт для тестування. Сервер запускається лише якщо файл викликано напряму.
if (require.main === module) {
    app.listen(3000, () => console.log("Server running on port 3000"));
}


module.exports = { app, validateItem, users, items };