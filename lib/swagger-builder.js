const fs = require('fs-extra');
const swaggerLoader = require('./swagger-loader');
const swaggerValidator = require('./swagger-validator');
const packageJson = require(`${process.cwd()}/package.json`);
const { version } = packageJson;

const build = async ({ src, dest }) => {
    const { schemasInternal, ...swagger } = await swaggerLoader.load({ path: src });
    swagger.info.version = version;
    await swaggerValidator.validate(swagger);
    await fs.writeFile(dest, JSON.stringify(swagger, null, 2));
    console.log('successfully build swagger');
};

module.exports = { build };
