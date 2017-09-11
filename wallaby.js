module.exports = () => {
  return {
    files: [
      './server/**/*.js',
    ],
    tests: [
      './server/**/*.test.js'
    ],
    debug: true
  };
};