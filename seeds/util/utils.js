const path = require('path');
const fs = require('fs');
const log = require('../../libs/logger')(module);
const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

function dateReviver(key, value) {
    if (typeof value === "string" && dateFormat.test(value)) {
        return new Date(value);
    }
    return value;
}

const saveFile = (name, data) => {
    try {
        const json = JSON.stringify(data, null, 4);
        const filePath = path.join(__dirname, '../static', `${name}.json`);
        fs.writeFile(filePath, json, 'utf8', function (err) {
            if (err) {
                log.info(`An error occurred while saving json file - ${err}`);
                return process.exit(1);
            }
            log.info(`File saved successfully in ${filePath}`);
        })
    } catch (err) {
        log.error(`An error occurred while saving json file - ${err}`);
        return process.exit(1);
    }
};

const getFromFiles = (names) => {
    const result = {};
    names.forEach(name => {
        const buffer = fs.readFileSync(path.join(__dirname, '../static', `${name}.json`));
        result[name] = JSON.parse(buffer.toString(), dateReviver);
    });
    return result;
};

/**
 * @param model - bookshelf model
 * @param pkKey - primery key name (user_id, camp_id etc...)
 */
const getLastId = (model, pkKey) => {
    return model.forge()
            .orderBy(pkKey, 'DESC')
            .fetch({columns: pkKey});
};

/**
 * Handles a combination of string and ids
 * @param inputText
 * @returns {*}
 */
function incrementId(inputText) {
    if (typeof inputText === 'number') {
        return inputText + 1;
    }
    const output = inputText.replace(/'/g, '').split(/(\d+)/).filter(Boolean);
    if (output && output.length > 1 && Number(output[1])) {
        return Number(output[1]) + 1;
    }
    return Number(output[1]) ? Number(output[1]) + 1 : 1;
}

/**
 * @param schemas - array of mock schemas
 */
const preventPkErrors = async (schemas) => {
    try {
        for (const schema of schemas) {
            const lastModel = await getLastId(schema.MODEL, schema.PK);
            schema.STRUCTURE.id.incrementalId = lastModel ?
                lastModel.id ? incrementId(lastModel.id) :
                    schema.STRUCTURE.id.incrementalId : schema.STRUCTURE.id.incrementalId;
        }
    } catch (err) {
        log.error(err);
        process.exit(-1);
    }

};

module.exports = {
    saveFile,
    getFromFiles,
    getLastId,
    preventPkErrors
};
