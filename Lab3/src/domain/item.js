const { Year } = require('./valueObjects');
const { ValidationError } = require('./errors');

class Item {
    constructor(id, title, year, material, ownerEmail) {
        this.id = id;
        this.title = title;
        this.year = year;
        this.material = material;
        this.ownerEmail = ownerEmail;
    }

    updateData(title, yearRaw, material) {
        if (!title || !material) {
            throw new ValidationError('Missing required fields');
        }
        const year = new Year(yearRaw);
        this.title = title;
        this.year = year.value;
        this.material = material;
    }
}

module.exports = { Item };