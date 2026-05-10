const { ValidationError, ConflictError, NotFoundError } = require('../domain/errors');

const errorHandler = (err, req, res, next) => {
    if (err instanceof ValidationError) {
        return res.status(400).json({ error: err.message });
    }
    if (err instanceof ConflictError) {
        return res.status(409).json({ error: err.message });
    }
    if (err instanceof NotFoundError) {
        return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Internal Server Error' });
};

module.exports = { errorHandler };