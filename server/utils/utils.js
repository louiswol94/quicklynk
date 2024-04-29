const shortid = require('shortid');

exports.generateShortId = () => {
  return shortid.generate();
};
