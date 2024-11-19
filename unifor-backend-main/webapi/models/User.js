const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

async function connect() {
  if (global.db) return global.db;
  const conn = await MongoClient.connect('mongodb+srv://antonio:<password>@cluster0.6uzzeth.mongodb.net/?retryWrites=true&w=majority');
  if (!conn) return new Error("Can't connect");
  global.db = await conn.db('unifor');
  return global.db;
}

async function createUser(userData) {
  const db = await connect();
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);

  userData.password = hashedPassword; // Salva a senha criptografada

  const result = await db.collection('users').insertOne(userData);
  return result;
}

async function findUserByEmail(email) {
  const db = await connect();
  const user = await db.collection('users').findOne({ email });
  return user;
}

async function findUserById(id) {
  const db = await connect();
  const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
  return user;
}

module.exports = { createUser, findUserByEmail, findUserById };
