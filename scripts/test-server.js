#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8765;
const DIST_DIR = path.join(__dirname, '../service/dist');
const BASE_PATH = '/photocard/service/pr-7';

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  let url = req.url || '/';
  
  if (url.startsWith(BASE_PATH)) {
    url = url.substring(BASE_PATH.length);
  }
  
  if (url === '/' || url === '') {
    url = '/index.html';
  }
  
  if (url.endsWith('/')) {
    url += 'index.html';
  }
  
  let filePath = path.join(DIST_DIR, url);
  
  if (!fs.existsSync(filePath)) {
    filePath = path.join(DIST_DIR, 'index.html');
  }
  
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'text/plain';
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}${BASE_PATH}`);
});
