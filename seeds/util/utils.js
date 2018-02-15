const path = require('path');
const fs = require('fs');

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

module.exports = {
    saveFile,
    getFromFiles
};
