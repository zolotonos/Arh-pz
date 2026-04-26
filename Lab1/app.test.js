const request = require('supertest');
const { app, validateItem, users, items } = require('./index');

describe('Unit Tests', () => {
    test('validateItem should return false for future years', () => {
        const futureYear = new Date().getFullYear() + 1;
        expect(validateItem('Coin', futureYear, 'Gold')).toBe(false); // Перевірка бізнес-правил
    });

    test('validateItem should return true for valid data', () => {
        expect(validateItem('Coin', 2000, 'Gold')).toBe(true);
    });
});

describe('Integration Tests', () => {
    beforeEach(() => {
        users.length = 0; // Очищення БД перед кожним тестом
        items.length = 0;
    });

    test('POST /items without token should return 401', async () => {
        const res = await request(app).post('/items').send({ title: 'A', year: 2000, material: 'B' });
        expect(res.status).toBe(401); // Перевірка що АРІ працює коректно
    });

    test('POST /login should return token for valid user', async () => {
        // Спочатку реєструємо
        await request(app).post('/register').send({ email: 'test@mail.com', password: 'password123' });
        
        // Потім логінимось
        const res = await request(app).post('/login').send({ email: 'test@mail.com', password: 'password123' });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
    });
});