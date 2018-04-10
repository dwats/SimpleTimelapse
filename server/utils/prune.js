const fs = require('fs-extra');
const path = require('path');

/**
 * Remove a list of files from a given directory
 *
 * @param {string} directory - directory to prune
 * @param {Array} files - an array of file names (strings)
 * @return {Promise}
 */
const prune = (directory, files) => {
  const promises = files.map((file) => {
    console.log('removing: ', file);
    const filepath = path.join(directory, file.filename);
    return fs.unlink(filepath);
  });
  return Promise.all(promises);
};

module.exports = {
  prune
};
