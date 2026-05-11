const { ItemFactory } = require('../src/domain/itemFactory');
const { ValidationError } = require('../src/domain/errors');
const { Year, Email } = require('../src/domain/valueObjects');

describe('Domain Layer: Unit Tests', () => {
    describe('Value Objects', () => {
        test('Year should throw ValidationError if year is in the future', () => {
            const futureYear = new Date().getFullYear() + 1;
            expect(() => new Year(futureYear)).toThrow(ValidationError);
        });

        test('Email should throw ValidationError if invalid', () => {
            expect(() => new Email('invalid-email')).toThrow(ValidationError);
        });
    });

    describe('ItemFactory & Item Entity', () => {
        let factory;

        beforeEach(() => {
            factory = new ItemFactory();
        });

        test('create() should return valid Item object', () => {
            const item = factory.create(1, 'Silver Coin', 1999, 'Silver', 'test@mail.com');
            expect(item.title).toBe('Silver Coin');
            expect(item.year).toBe(1999);
            expect(item.id).toBe(1);
        });

        test('create() should throw ValidationError if title is missing', () => {
            expect(() => factory.create(1, '', 2000, 'Gold', 'test@mail.com')).toThrow(ValidationError);
        });

        test('updateData() should update fields', () => {
            const item = factory.create(1, 'Silver Coin', 1999, 'Silver', 'test@mail.com');
            item.updateData('Gold Coin', 2005, 'Gold');
            expect(item.title).toBe('Gold Coin');
            expect(item.year).toBe(2005);
            expect(item.material).toBe('Gold');
        });

        test('updateData() should throw ValidationError if data is invalid', () => {
            const item = factory.create(1, 'Silver Coin', 1999, 'Silver', 'test@mail.com');
            const futureYear = new Date().getFullYear() + 1;
            expect(() => item.updateData('Gold Coin', futureYear, 'Gold')).toThrow(ValidationError);
        });
    });
});