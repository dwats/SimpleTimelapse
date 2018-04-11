/**
 * Move uploaded file to a given filepath and return promise.
 * @param {string} filepath - full path for file's save directory
 * @param {string} file - file to be saved
 * @return {Promise}
 */
module.exports = (filepath, file) => {
  return new Promise((resolve, reject) => {
    file.mv(filepath, (err) => {
      if (err) return reject(err);
      return resolve();
    });
  });
};
