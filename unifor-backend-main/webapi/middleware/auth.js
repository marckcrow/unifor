const jwt = require('jsonwebtoken');

// Middleware para verificar o token JWT
function verifyToken(req, res, next) {
  const token = req.headers['authorization']; // Token esperado no cabeçalho
  if (!token) {
    return res.status(403).json({ message: 'Token não fornecido.' });
  }

  // Verifica a validade do token
  jwt.verify(token, 'secretkey', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido.' });
    }
    req.userId = decoded.id; // Salva o ID do usuário decodificado no request
    req.userRole = decoded.role; // Salva o tipo de usuário no request (role)
    next(); // Passa o controle para o próximo middleware ou rota
  });
}

// Middleware para verificar se o usuário tem a role de 'admin'
function isAdmin(req, res, next) {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado. Você não é um administrador.' });
  }
  next(); // Passa o controle para a próxima etapa
}

module.exports = { verifyToken, isAdmin };
