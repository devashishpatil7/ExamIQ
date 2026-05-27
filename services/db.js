const { CosmosClient } = require("@azure/cosmos");
const Database = require("better-sqlite3");
const path = require("path");

const { USE_SQLITE, COSMOS_DB_CONNECTION_STRING } = require("../config/secrets");

const useSqliteFlag = USE_SQLITE === "true";

let cosmosContainer = null;
let sqliteDb = null;

if (useSqliteFlag) {
  const dbPath = process.env.DATABASE_PATH || path.join(__dirname, "..", "exam_iq.db");
  sqliteDb = new Database(dbPath);
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("   [services/db.js] Initialized SQLite fallback for users");
} else {
  const connectionString = COSMOS_DB_CONNECTION_STRING;
  if (!connectionString) {
    console.warn("   [services/db.js] WARNING: COSMOS_DB_CONNECTION_STRING is not set.");
  } else {
    try {
      const client = new CosmosClient(connectionString);
      const database = client.database("examiq-db");
      cosmosContainer = database.container("users");
      console.log("   [services/db.js] Initialized Cosmos DB for users");
    } catch (err) {
      console.error("   [services/db.js] Failed to initialize Cosmos DB:", err.message);
    }
  }
}

async function createUser(user) {
  if (useSqliteFlag) {
    try {
      const stmt = sqliteDb.prepare("INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)");
      const info = stmt.run(user.id, user.email, user.password, user.name);
      return { _rowid: info.lastInsertRowid, ...user };
    } catch (error) {
      console.error("SQLite createUser error:", error.message);
      throw error;
    }
  } else {
    try {
      if (!cosmosContainer) throw new Error("Cosmos DB container not initialized.");
      if (!user.id) user.id = Date.now().toString();
      const { resource } = await cosmosContainer.items.create(user);
      return resource;
    } catch (err) {
      console.error("Insert error:", err);
      throw err;
    }
  }
}

async function getUserByEmail(email) {
  if (useSqliteFlag) {
    try {
      const stmt = sqliteDb.prepare("SELECT * FROM users WHERE email = ?");
      return stmt.get(email);
    } catch (error) {
      console.error("SQLite getUserByEmail error:", error.message);
      throw error;
    }
  } else {
    try {
      if (!cosmosContainer) throw new Error("Cosmos DB container not initialized.");
      const querySpec = {
        query: "SELECT * FROM c WHERE c.email = @email",
        parameters: [{ name: "@email", value: email }]
      };
      const { resources } = await cosmosContainer.items.query(querySpec).fetchAll();
      return resources.length > 0 ? resources[0] : null;
    } catch (error) {
      console.error("   [services/db.js] Cosmos DB getUserByEmail error:", error.message);
      throw error;
    }
  }
}

module.exports = { createUser, getUserByEmail };
