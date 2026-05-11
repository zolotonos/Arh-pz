class InMemoryItemRepository {
    constructor() {
        this.items = [];
        this.currentId = 1;
    }

    async generateId() {
        return this.currentId++;
    }

    async save(item) {
        this.items.push(item);
    }

    async findByOwner(email) {
        return this.items.filter(i => i.ownerEmail === email);
    }

    async findByIdAndOwner(id, email) {
        return this.items.find(i => i.id === id && i.ownerEmail === email);
    }

    async update(item) {
        const index = this.items.findIndex(i => i.id === item.id);
        if (index !== -1) {
            this.items[index] = item;
        }
    }

    async delete(id) {
        const index = this.items.findIndex(i => i.id === id);
        if (index !== -1) {
            this.items.splice(index, 1);
        }
    }
}

module.exports = { InMemoryItemRepository };