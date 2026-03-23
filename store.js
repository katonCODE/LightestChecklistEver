const fs = require('fs');

const createStore = (filePath) => ({
  load: () => {
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  },
  save: (items) => fs.writeFileSync(filePath, JSON.stringify(items, null, 2))
});

module.exports = { createStore };
