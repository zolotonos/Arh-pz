const { ItemCreateCommandHandler, ItemCreateCommand } = require('../src/application/useCases');
const { ItemFactory } = require('../src/domain/itemFactory');
const { InMemoryItemRepository } = require('../src/infrastructure/repository');
const { ValidationError } = require('../src/domain/errors');

describe('Command Handlers: Unit Tests (CQS)', () => {
    let repository;
    let factory;
    let handler;

    beforeEach(() => {
        repository = new InMemoryItemRepository();
        factory = new ItemFactory();
        handler = new ItemCreateCommandHandler(repository, factory);
    });

    test('ItemCreateCommandHandler should successfully create item and return ID', async () => {
        const command = new ItemCreateCommand('Test Coin', 2000, 'Gold', 'test@mail.com');
        const id = await handler.execute(command);

        expect(id).toBe(1);
        expect(repository.items.length).toBe(1);
        expect(repository.items[0].title).toBe('Test Coin');
    });

    test('ItemCreateCommandHandler should throw ValidationError if domain data is invalid', async () => {
        const futureYear = new Date().getFullYear() + 1;
        const command = new ItemCreateCommand('Future Coin', futureYear, 'Gold', 'test@mail.com');

        await expect(handler.execute(command)).rejects.toThrow(ValidationError);
    });
});