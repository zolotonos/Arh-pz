const { NotFoundError } = require('../domain/errors');

// ==========================================
// COMMANDS (Операції запису)
// ==========================================

class ItemCreateCommand {
    constructor(title, yearRaw, material, ownerEmail) {
        this.title = title;
        this.yearRaw = yearRaw;
        this.material = material;
        this.ownerEmail = ownerEmail;
    }
}

class ItemCreateCommandHandler {
    constructor(itemRepository, itemFactory) {
        this.itemRepository = itemRepository;
        this.itemFactory = itemFactory;
    }

    async execute(command) {
        const id = await this.itemRepository.generateId();
        const item = this.itemFactory.create(
            id, 
            command.title, 
            command.yearRaw, 
            command.material, 
            command.ownerEmail
        );
        await this.itemRepository.save(item);
        return id;
    }
}

class ItemUpdateCommand {
    constructor(id, title, yearRaw, material, ownerEmail) {
        this.id = id;
        this.title = title;
        this.yearRaw = yearRaw;
        this.material = material;
        this.ownerEmail = ownerEmail;
    }
}

class ItemUpdateCommandHandler {
    constructor(itemRepository) {
        this.itemRepository = itemRepository;
    }

    async execute(command) {
        const item = await this.itemRepository.findByIdAndOwner(command.id, command.ownerEmail);
        if (!item) {
            throw new NotFoundError('Item not found');
        }
        item.updateData(command.title, command.yearRaw, command.material);
        await this.itemRepository.update(item);
    }
}

class ItemDeleteCommand {
    constructor(id, ownerEmail) {
        this.id = id;
        this.ownerEmail = ownerEmail;
    }
}

class ItemDeleteCommandHandler {
    constructor(itemRepository) {
        this.itemRepository = itemRepository;
    }

    async execute(command) {
        const item = await this.itemRepository.findByIdAndOwner(command.id, command.ownerEmail);
        if (!item) {
            throw new NotFoundError('Item not found');
        }
        await this.itemRepository.delete(command.id);
    }
}

// ==========================================
// QUERIES (Операції читання)
// ==========================================

class GetItemsListQuery {
    constructor(ownerEmail) {
        this.ownerEmail = ownerEmail;
    }
}

class ItemReadModel {
    constructor(id, title, year, material, ownerEmail) {
        this.id = id;
        this.title = title;
        this.year = year;
        this.material = material;
        this.ownerEmail = ownerEmail;
    }
}

class GetItemsListQueryHandler {
    constructor(itemRepository) {
        this.itemRepository = itemRepository;
    }

    async execute(query) {
        const items = await this.itemRepository.findByOwner(query.ownerEmail);
        return items.map(item => new ItemReadModel(
            item.id,
            item.title,
            item.year,
            item.material,
            item.ownerEmail
        ));
    }
}

/**
 * Запит на отримання конкретного предмета
 */
class GetItemByIdQuery {
    constructor(id, ownerEmail) {
        this.id = id;
        this.ownerEmail = ownerEmail;
    }
}

/**
 * Обробник запиту на отримання конкретного предмета
 */
class GetItemByIdQueryHandler {
    constructor(itemRepository) {
        this.itemRepository = itemRepository;
    }

    async execute(query) {
        // Шукаємо доменну сутність
        const item = await this.itemRepository.findByIdAndOwner(query.id, query.ownerEmail);
        
        // Викидаємо помилку, якщо не знайдено (як і в Commands)
        if (!item) {
            throw new NotFoundError('Item not found');
        }

        // Повертаємо DTO (Read Model), а не саму сутність
        return new ItemReadModel(
            item.id,
            item.title,
            item.year,
            item.material,
            item.ownerEmail
        );
    }
}

module.exports = { 
    ItemCreateCommand, 
    ItemCreateCommandHandler, 
    ItemUpdateCommand,
    ItemUpdateCommandHandler, 
    ItemDeleteCommand,
    ItemDeleteCommandHandler,
    GetItemsListQuery,
    ItemReadModel,
    GetItemsListQueryHandler,
    GetItemByIdQuery,
    GetItemByIdQueryHandler
};