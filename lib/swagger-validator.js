const swaggerParser = require('swagger-parser');

const validate = async (swagger) => {
    await swaggerParser.validate(swagger);
};

module.exports = { validate };
