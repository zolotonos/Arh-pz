const { NotFoundError } = require('../domain/errors');

class CreateItemUseCase {
    constructor(itemRepository, itemFactory) {
        this.itemRepository = itemRepository;
        this.itemFactory = itemFactory;
    }

    async execute(title, yearRaw, material, ownerEmail) {
        const id = await this.itemRepository.generateId();
        const item = this.itemFactory.create(id, title, yearRaw, material, ownerEmail);
        await this.itemRepository.save(item);
        return item;
    }
}

class GetItemsUseCase {
    constructor(itemRepository) {
        this.itemRepository = itemRepository;
    }

    async execute(ownerEmail) {
        return await this.itemRepository.findByOwner(ownerEmail);
    }
}

class UpdateItemUseCase {
    constructor(itemRepository) {
        this.itemRepository = itemRepository;
    }

    async execute(id, title, yearRaw, material, ownerEmail) {
        const item = await this.itemRepository.findByIdAndOwner(id, ownerEmail);
        if (!item) {
            throw new NotFoundError('Item not found');
        }
        item.updateData(title, yearRaw, material);
        await this.itemRepository.update(item);
        return item;
    }
}

class DeleteItemUseCase {
    constructor(itemRepository) {
        this.itemRepository = itemRepository;
    }

    async execute(id, ownerEmail) {
        const item = await this.itemRepository.findByIdAndOwner(id, ownerEmail);
        if (!item) {
            throw new NotFoundError('Item not found');
        }
        await this.itemRepository.delete(id);
    }
}

module.exports = { CreateItemUseCase, GetItemsUseCase, UpdateItemUseCase, DeleteItemUseCase };