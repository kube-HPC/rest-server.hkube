const fs = require('fs-extra');
const { resolveRefs } = require('json-refs');
const YAML = require('js-yaml');

const load = async ({ path, file = 'index.yaml' }) => {
    const swaggerFile = await fs.readFile(`${path}/${file}`, 'utf-8');
    const root = YAML.load(swaggerFile);
    const swaggerOptions = {
        filter: ['relative', 'remote'],
        location: path,
        loaderOptions: {
            processContent: (res, callback) => {
                callback(null, YAML.load(res.text));
            }
        }
    };
    const results = await resolveRefs(root, swaggerOptions);
    return results.resolved;
};

module.exports = { load };
