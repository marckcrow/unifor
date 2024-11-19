// server.js
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Servidor Node.js está funcionando!\n');
});

server.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000/');
});
