const fs = require('fs');

let data = {};

fs.readFile(`${__dirname}/data.db`, (err, file) => {
  if (err || !file || !file.length) return;
  data = JSON.parse(file);
});

module.exports = {
  get: (type) => {
    return data[type] || data;
  },

  add: (type, entry) => {
    data[type] = entry;
    fs.writeFile(`${__dirname}/data.db`,
      JSON.stringify(data),
      () => {
        console.log('Data saved.');
      }
    );
  },
};
