const http = require('http');
const fs = require('fs');
const path = require('path');

const host = '0.0.0.0';
const port = 4173;
const root = __dirname;
const types = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.webmanifest': 'application/manifest+json; charset=utf-8',
    '.png': 'image/png',
};

http.createServer((req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405);
        res.end();
        return;
    }

    let pathname;
    try {
        pathname = decodeURIComponent(new URL(req.url, `http://${host}`).pathname);
    } catch {
        res.writeHead(400);
        res.end();
        return;
    }

    if (pathname === '/') pathname = '/index.html';
    const filePath = path.resolve(root, '.' + pathname);
    if (filePath !== root && !filePath.startsWith(root + path.sep)) {
        res.writeHead(403);
        res.end();
        return;
    }

    fs.readFile(filePath, (error, data) => {
        if (error) {
            res.writeHead(error.code === 'ENOENT' ? 404 : 500);
            res.end();
            return;
        }
        res.writeHead(200, {
            'Content-Type': types[path.extname(filePath)] || 'application/octet-stream',
            'Cache-Control': 'no-store',
        });
        if (req.method === 'HEAD') res.end();
        else res.end(data);
    });
}).listen(port, host);
