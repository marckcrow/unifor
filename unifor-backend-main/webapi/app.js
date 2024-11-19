//app.js
const {MongoClient, ObjectId} = require("mongodb");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail } = require('./models/User');
const { verifyToken, isAdmin } = require('./middleware/auth');
const express = require('express');
const router = express.Router(); // Inicialização correta do router


// Rota para listar todos os usuários (apenas para admins)
router.get('/users', verifyToken, isAdmin, async function (req, res) {
  try {
    const db = await connect();
    const users = await db.collection('users').find().toArray();
    res.json(users);
  } catch (err) {
    res.status(500).json({ erro: `${err}` });
  }
});

// Rota para excluir um usuário (apenas para admins)
router.delete('/users/:id', verifyToken, isAdmin, async function (req, res) {
  try {
    const db = await connect();
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: 'Usuário excluído com sucesso.' });
  } catch (err) {
    res.status(500).json({ erro: `${err}` });
  }
});



// Rota de registro de usuário
router.post('/register', async function (req, res) {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({ message: 'Usuário já existe.' });
    }

    const newUser = {
      name,
      email,
      password,
      role: role || 'user', // Por padrão, o usuário será do tipo 'user'
    };

    const user = await createUser(newUser);
    res.status(201).json({ message: 'Usuário registrado com sucesso!' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ erro: `${err}` });
  }
});
// Rota de login
router.post('/login', async function (req, res) {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(400).json({ message: 'Usuário não encontrado.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Senha incorreta.' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, 'secretkey', { expiresIn: '1h' });
    res.json({ message: 'Login bem-sucedido', token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ erro: `${err}` });
  }
});

async function connect(){
  if(global.db) return global.db;
    const conn = await MongoClient.connect("mongodb+srv://antonio:<password>@cluster0.6uzzeth.mongodb.net/?retryWrites=true&w=majority");
  if(!conn) return new Error("Can't connect");
    global.db = await conn.db("unifor");
  return global.db;
}

const app = express();         
const port = 3000; //porta padrão

app.use(require('cors')());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//definindo as rotas
router.get('/', (req, res) => res.json({ message: 'Funcionando!' }));

// GET dog
router.get('/dog', async function(req, res, next) {
  try{
    const apidog = await fetch('https://dog.ceo/api/breed/hound/list');
    res.json(await apidog.json());
  }
  catch(ex){
    console.log(ex);
    res.status(400).json({erro: `${ex}`});
  }
}) 

/* GET aluno */
router.get('/aluno/:id?', async function(req, res, next) {
    try{
      const db = await connect();
      if(req.params.id)
        res.json(await db.collection("aluno").findOne({_id: new ObjectId(req.params.id)}));
      else
        res.json(await db.collection("aluno").find().toArray());
    }
    catch(ex){
      console.log(ex);
      res.status(400).json({erro: `${ex}`});
    }
})

// POST /aluno
router.post('/aluno', async function(req, res, next){
    try{
      const aluno = req.body;
      const db = await connect();
      res.json(await db.collection("aluno").insertOne(aluno));
    }
    catch(ex){
      console.log(ex);
      res.status(400).json({erro: `${ex}`});
    }
})

// PUT /aluno/{id}
router.put('/aluno/:id', async function(req, res, next){
    try{
      const aluno = req.body;
      const db = await connect();
      res.json(await db.collection("aluno").updateOne({_id: new ObjectId(req.params.id)}, {$set: aluno}));
    }
    catch(ex){
      console.log(ex);
      res.status(400).json({erro: `${ex}`});
    }
})

// DELETE /aluno/{id}
router.delete('/aluno/:id', async function(req, res, next){
    try{
      const db = await connect();
      res.json(await db.collection("aluno").deleteOne({_id: new ObjectId(req.params.id)}));
    }
    catch(ex){
      console.log(ex);
      res.status(400).json({erro: `${ex}`});
    }
})

app.use('/', router);

//inicia o servidor
app.listen(port);
console.log('API funcionando!');