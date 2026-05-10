const { Item } = require('./item');
const { Year } = require('./valueObjects');
const { ValidationError } = require('./errors');

class ItemFactory {
    create(id, title, yearRaw, material, ownerEmail) {
        if (!title || !material) {
            throw new ValidationError('Missing required fields');
        }
        const year = new Year(yearRaw);
        return new Item(id, title, year.value, material, ownerEmail);
    }
}

module.exports = { ItemFactory, Item };