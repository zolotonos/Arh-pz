const { ValidationError } = require('./errors');

class Email {
    constructor(value) {
        if (!value || !value.includes('@')) {
            throw new ValidationError('Invalid email format');
        }
        this.value = value;
    }
}

class Year {
    constructor(value) {
        const currentYear = new Date().getFullYear();
        if (!value || value > currentYear) {
            throw new ValidationError('Invalid year');
        }
        this.value = value;
    }
}

module.exports = { Email, Year };