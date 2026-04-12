import { createReadStream } from 'node:fs';
import { access, stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';

const args = process.argv.slice(2);

function readArg(name, fallback) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] ?? fallback : fallback;
}

const host = readArg('--host', '127.0.0.1');
const port = Number.parseInt(readArg('--port', '4173'), 10);
const outputRoot = path.join(process.cwd(), 'out');

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.xml', 'application/xml; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.svg', 'image/svg+xml'],
  ['.ico', 'image/x-icon'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
]);

function resolveDistPath(requestPath) {
  const normalizedPath = requestPath === '/' ? '/index.html' : requestPath;
  const absolutePath = path.join(outputRoot, normalizedPath);

  if (path.extname(absolutePath)) {
    return absolutePath;
  }

  return path.join(outputRoot, normalizedPath, 'index.html');
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', `http://${host}:${port}`);
    const filePath = resolveDistPath(url.pathname);

    await access(filePath);
    const fileStat = await stat(filePath);

    if (!fileStat.isFile()) {
      response.writeHead(404);
      response.end('Not Found');
      return;
    }

    const contentType = contentTypes.get(path.extname(filePath)) ?? 'application/octet-stream';
    response.writeHead(200, { 'Content-Type': contentType });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not Found');
  }
});

server.listen(port, host, () => {
  process.stdout.write(`Static preview server ready at http://${host}:${port}\n`);
});
