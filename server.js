const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.PORT) || 3000;
const root = __dirname;
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic']);

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {

  if (req.url.startsWith('/api/day-photos')) {
    const requestUrl = new URL(req.url, `http://127.0.0.1:${port}`);
    const day = requestUrl.searchParams.get('day');

    if (!day) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ photos: [] }));
      return;
    }

    const dayDir = path.join(root, 'assets', 'photos', day);
    fs.readdir(dayDir, { withFileTypes: true }, (dirError, entries) => {
      if (dirError) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ photos: [] }));
        return;
      }

      const photos = entries
        .filter((entry) => entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase()))
        .map((entry) => ({
          filePath: path.join(dayDir, entry.name),
          name: entry.name,
          mtimeMs: fs.statSync(path.join(dayDir, entry.name)).mtimeMs
        }))
        .sort((a, b) => a.name.localeCompare(b.name) || a.mtimeMs - b.mtimeMs)
        .map((entry) => path.relative(root, entry.filePath).split(path.sep).join('/'));

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ photos }));
    });
    return;
  }

  if (req.url === '/api/latest-upload') {
    const uploadsDir = path.join(root, 'uploads');

    fs.readdir(uploadsDir, { withFileTypes: true }, (dirError, entries) => {
      if (dirError) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ path: null }));
        return;
      }

      const imageFiles = entries
        .filter((entry) => entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase()))
        .map((entry) => path.join(uploadsDir, entry.name));

      if (imageFiles.length === 0) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ path: null }));
        return;
      }

      const withStats = imageFiles.map((filePath) => ({
        filePath,
        mtimeMs: fs.statSync(filePath).mtimeMs
      }));

      withStats.sort((a, b) => b.mtimeMs - a.mtimeMs);
      const latest = withStats[0];
      const relativePath = path.relative(root, latest.filePath).split(path.sep).join('/');

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ path: relativePath }));
    });
    return;
  }

  const requestPath = req.url === '/' ? '/index.html' : req.url;
  const safePath = path.normalize(requestPath).replace(/^\/+/, '');
  const filePath = path.join(root, safePath);

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': contentTypes[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
