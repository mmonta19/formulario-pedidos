import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const port = process.env.PORT || 5173;
const root = process.cwd();

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

const server = http.createServer(async (req, res) => {
  try {
    let reqPath = req.url?.split('?')[0] || '/';
    if (reqPath === '/') reqPath = '/index.html';
    const safePath = path.normalize(reqPath).replace(/^\.\.(\/|\\|$)/, '');
    const filePath = path.join(root, safePath);
    const ext = path.extname(filePath);
    const content = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain; charset=utf-8' });
    res.end(content);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('No encontrado');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Servidor listo en http://localhost:${port}`);
});
