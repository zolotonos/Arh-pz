const express = require('express');
const jwt = require('jsonwebtoken');

const { InMemoryItemRepository } = require('../infrastructure/repository');
const { ItemFactory } = require('../domain/itemFactory');
const { 
    CreateItemUseCase, 
    GetItemsUseCase, 
    UpdateItemUseCase, 
    DeleteItemUseCase 
} = require('../application/useCases');
const { errorHandler } = require('./errorHandler');

const app = express();
app.use(express.json());

const SECRET = 'super-secret-key';
const users = [];

const itemRepository = new InMemoryItemRepository();
const itemFactory = new ItemFactory();

const createItemUseCase = new CreateItemUseCase(itemRepository, itemFactory);
const getItemsUseCase = new GetItemsUseCase(itemRepository);
const updateItemUseCase = new UpdateItemUseCase(itemRepository);
const deleteItemUseCase = new DeleteItemUseCase(itemRepository);

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: "Unauthorized" });
        req.user = decoded;
        next();
    });
};

app.post('/register', (req, res) => {
    const { email, password } = req.body;
    if (!email || !email.includes('@') || !password) return res.status(400).json({ error: "Invalid" });
    if (users.find(u => u.email === email)) return res.status(409).json({ error: "Conflict" });
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

app.post('/items', authMiddleware, async (req, res, next) => {
    try {
        const { title, year, material } = req.body;
        const newItem = await createItemUseCase.execute(title, year, material, req.user.email);
        res.status(201).json(newItem);
    } catch (err) {
        next(err);
    }
});

app.get('/items', authMiddleware, async (req, res, next) => {
    try {
        const items = await getItemsUseCase.execute(req.user.email);
        res.status(200).json(items);
    } catch (err) {
        next(err);
    }
});

app.put('/items/:id', authMiddleware, async (req, res, next) => {
    try {
        const { title, year, material } = req.body;
        const itemId = parseInt(req.params.id);
        const updatedItem = await updateItemUseCase.execute(itemId, title, year, material, req.user.email);
        res.status(200).json(updatedItem);
    } catch (err) {
        next(err);
    }
});

app.delete('/items/:id', authMiddleware, async (req, res, next) => {
    try {
        const itemId = parseInt(req.params.id);
        await deleteItemUseCase.execute(itemId, req.user.email);
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

app.use(errorHandler);

if (require.main === module) {
    app.listen(3000, () => console.log("Server running on port 3000"));
}

module.exports = { app, itemRepository, users };