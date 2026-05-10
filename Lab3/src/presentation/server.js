const express = require('express');
const jwt = require('jsonwebtoken');
const { InMemoryItemRepository } = require('../infrastructure/repository');
const { ItemFactory } = require('../domain/itemFactory');
const { errorHandler } = require('./errorHandler');
const UC = require('../application/useCases'); // Імпортуємо все як UC для стислості

const app = express();
app.use(express.json());

const SECRET = 'super-secret-key';
const users = [];
const repo = new InMemoryItemRepository();
const factory = new ItemFactory();

// Ініціалізація Handlers
const handlers = {
    create: new UC.ItemCreateCommandHandler(repo, factory),
    update: new UC.ItemUpdateCommandHandler(repo),
    delete: new UC.ItemDeleteCommandHandler(repo),
    list: new UC.GetItemsListQueryHandler(repo),
    getById: new UC.GetItemByIdQueryHandler(repo)
};

const auth = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    jwt.verify(token || '', SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: "Unauthorized" });
        req.user = decoded;
        next();
    });
};

// --- AUTH ---
app.post('/register', (req, res) => {
    const { email, password } = req.body;
    if (!email?.includes('@') || !password) return res.status(400).json({ error: "Invalid" });
    if (users.find(u => u.email === email)) return res.status(409).json({ error: "Conflict" });
    users.push({ email, password });
    res.status(201).json({ message: "Created" });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    res.json({ token: jwt.sign({ email: user.email }, SECRET, { expiresIn: '1h' }) });
});

// --- API (CQS) ---

app.post('/items', auth, async (req, res, next) => {
    try {
        const id = await handlers.create.execute(
            new UC.ItemCreateCommand(req.body.title, req.body.year, req.body.material, req.user.email)
        );
        res.status(201).json({ id });
    } catch (err) { next(err); }
});

app.get('/items', auth, async (req, res, next) => {
    try {
        const items = await handlers.list.execute(new UC.GetItemsListQuery(req.user.email));
        res.json(items);
    } catch (err) { next(err); }
});

app.get('/items/:id', auth, async (req, res, next) => {
    try {
        const item = await handlers.getById.execute(
            new UC.GetItemByIdQuery(parseInt(req.params.id), req.user.email)
        );
        res.json(item);
    } catch (err) { next(err); }
});

app.put('/items/:id', auth, async (req, res, next) => {
    try {
        await handlers.update.execute(
            new UC.ItemUpdateCommand(parseInt(req.params.id), req.body.title, req.body.year, req.body.material, req.user.email)
        );
        res.json({ message: "Updated" });
    } catch (err) { next(err); }
});

app.delete('/items/:id', auth, async (req, res, next) => {
    try {
        await handlers.delete.execute(new UC.ItemDeleteCommand(parseInt(req.params.id), req.user.email));
        res.status(204).send();
    } catch (err) { next(err); }
});

app.use(errorHandler);
if (require.main === module) app.listen(3000, () => console.log("Server on 3000"));

module.exports = { app, itemRepository: repo, users };