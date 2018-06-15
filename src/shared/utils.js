const crypto = require('crypto');

function generateRandomHash() {
  const current_date = (new Date()).valueOf().toString();
  const random = Math.random().toString();
  return crypto.createHash('sha1').update(current_date + random).digest('hex');  
}

module.exports = {
    generateRandomHash
}