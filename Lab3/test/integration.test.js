const request = require('supertest');
const { app, itemRepository, users } = require('../src/presentation/server');

describe('Integration Tests (Full App Flow)', () => {
    let token;

    beforeEach(async () => {
        itemRepository.items = [];
        itemRepository.currentId = 1;
        users.length = 0;

        await request(app).post('/register').send({ email: 'test@mail.com', password: 'password123' });
        const loginRes = await request(app).post('/login').send({ email: 'test@mail.com', password: 'password123' });
        token = loginRes.body.token;
    });

    test('POST /items should create item and return 201', async () => {
        const res = await request(app)
            .post('/items')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Ancient Coin', year: 1500, material: 'Bronze' });

        expect(res.status).toBe(201);
        expect(res.body.title).toBe('Ancient Coin');
        expect(res.body.id).toBe(1);
    });

    test('GET /items should return user items', async () => {
        await request(app)
            .post('/items')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Ancient Coin', year: 1500, material: 'Bronze' });

        const res = await request(app)
            .get('/items')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].title).toBe('Ancient Coin');
    });

    test('PUT /items/:id should update item and return 200', async () => {
        const createRes = await request(app)
            .post('/items')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Ancient Coin', year: 1500, material: 'Bronze' });

        const itemId = createRes.body.id;

        const updateRes = await request(app)
            .put(`/items/${itemId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Restored Coin', year: 1500, material: 'Gold' });

        expect(updateRes.status).toBe(200);
        expect(updateRes.body.title).toBe('Restored Coin');
        expect(updateRes.body.material).toBe('Gold');
    });

    test('DELETE /items/:id should remove item and return 204', async () => {
        const createRes = await request(app)
            .post('/items')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Ancient Coin', year: 1500, material: 'Bronze' });

        const itemId = createRes.body.id;

        const deleteRes = await request(app)
            .delete(`/items/${itemId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(deleteRes.status).toBe(204);

        const getRes = await request(app)
            .get('/items')
            .set('Authorization', `Bearer ${token}`);

        expect(getRes.body.length).toBe(0);
    });

    test('POST /items with future year should return 400', async () => {
        const futureYear = new Date().getFullYear() + 5;
        const res = await request(app)
            .post('/items')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Future Coin', year: futureYear, material: 'Gold' });

        expect(res.status).toBe(400);
    });
});