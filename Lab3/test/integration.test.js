const request = require('supertest');
const { app, itemRepository, users } = require('../src/presentation/server');

describe('Integration Tests (Queries and HTTP Flow)', () => {
    let token;

    beforeEach(async () => {
        itemRepository.items = [];
        itemRepository.currentId = 1;
        users.length = 0;

        await request(app).post('/register').send({ email: 'test@mail.com', password: 'password123' });
        const loginRes = await request(app).post('/login').send({ email: 'test@mail.com', password: 'password123' });
        token = loginRes.body.token;
    });

    test('GET /items should return Read Models (DTOs) for user items', async () => {
        await request(app)
            .post('/items')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Ancient Coin', year: 1500, material: 'Bronze' });

        const res = await request(app)
            .get('/items')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        
        const readModel = res.body[0];
        expect(readModel).toHaveProperty('id');
        expect(readModel).toHaveProperty('title', 'Ancient Coin');
        expect(readModel).toHaveProperty('year', 1500);
        expect(readModel).toHaveProperty('ownerEmail', 'test@mail.com');
    });

    test('GET /items/:id should return specific item Read Model', async () => {
        const createRes = await request(app)
            .post('/items')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Rare Stamp', year: 1990, material: 'Paper' });

        const itemId = createRes.body.id;

        const res = await request(app)
            .get(`/items/${itemId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.title).toBe('Rare Stamp');
        expect(res.body.id).toBe(itemId);
    });

    test('POST /items with invalid data should map Domain Error to 400 Bad Request', async () => {
        const futureYear = new Date().getFullYear() + 5;
        const res = await request(app)
            .post('/items')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Future Coin', year: futureYear, material: 'Gold' });

        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });
});