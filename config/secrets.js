const fs = require('fs');

function getSecret(name) {
  try {
    return fs.readFileSync(`/mnt/secrets/${name}`, 'utf8').trim();
  } catch (err) {
    console.error(`Failed to read secret ${name}:`, err.message);
    return null;
  }
}

module.exports = {
  GEMINI_API_KEY: getSecret('GEMINI-API-KEY'),
  COSMOS_DB_CONNECTION_STRING: getSecret('COSMOS-DB-CONNECTION-STRING'),
  USE_SQLITE: getSecret('USE-SQLITE')
};
