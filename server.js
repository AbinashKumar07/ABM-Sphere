'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || '0.0.0.0';
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 60000);
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 120);
const MAX_BODY_BYTES = Number(process.env.MAX_BODY_BYTES || 65536);
const AUDIT_MAX_ENTRIES = Number(process.env.AUDIT_MAX_ENTRIES || 500);
const STARTED_AT = Date.now();

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.zip': 'application/zip',
    '.txt': 'text/plain; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8',
    '.md': 'text/markdown; charset=utf-8'
};

// In-memory rate limiter (per IP) & audit event log (non-sensitive operational telemetry only)
const rateBuckets = new Map();
const auditEvents = [];

function applySecurityHeaders(res) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader(
        'Content-Security-Policy',
        [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com data:",
            "img-src 'self' data: blob:",
            "connect-src 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "frame-ancestors 'self'"
        ].join('; ')
    );
}

function sendJson(res, statusCode, payload) {
    applySecurityHeaders(res);
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
    });
    res.end(JSON.stringify(payload));
}

function checkRateLimit(req) {
    const ip = (req.socket && req.socket.remoteAddress) || 'local';
    const now = Date.now();
    let bucket = rateBuckets.get(ip);
    if (!bucket || now - bucket.windowStart > RATE_LIMIT_WINDOW_MS) {
        bucket = { windowStart: now, count: 0 };
        rateBuckets.set(ip, bucket);
    }
    bucket.count += 1;
    return bucket.count <= RATE_LIMIT_MAX;
}

function readJsonBody(req) {
    return new Promise((resolve, reject) => {
        let size = 0;
        const chunks = [];
        req.on('data', (chunk) => {
            size += chunk.length;
            if (size > MAX_BODY_BYTES) {
                reject(Object.assign(new Error('Payload too large'), { statusCode: 413 }));
                req.destroy();
                return;
            }
            chunks.push(chunk);
        });
        req.on('end', () => {
            try {
                const raw = Buffer.concat(chunks).toString('utf8').trim();
                resolve(raw ? JSON.parse(raw) : {});
            } catch (e) {
                reject(Object.assign(new Error('Invalid JSON payload'), { statusCode: 400 }));
            }
        });
        req.on('error', (err) => reject(err));
    });
}

function sanitizeText(val, maxLen = 120) {
    return String(val || '').replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, maxLen);
}

function serve404(res, reqPath) {
    const notFoundPath = path.join(ROOT_DIR, '404.html');
    applySecurityHeaders(res);
    fs.readFile(notFoundPath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
            return res.end(`404 Not Found: ${sanitizeText(reqPath, 80)}`);
        }
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        res.end(data);
    });
}

function handleApi(req, res, urlPath) {
    if (!checkRateLimit(req)) {
        return sendJson(res, 429, { error: 'Too many requests. Please slow down.' });
    }

    if (urlPath === '/api/health' && req.method === 'GET') {
        return sendJson(res, 200, {
            status: 'ok',
            service: 'ABM Sphere',
            version: '4.2.0',
            uptimeSeconds: Math.floor((Date.now() - STARTED_AT) / 1000),
            timestamp: new Date().toISOString(),
            checks: {
                indexHtml: fs.existsSync(path.join(ROOT_DIR, 'index.html')),
                notFoundPage: fs.existsSync(path.join(ROOT_DIR, '404.html')),
                extensionBundle: fs.existsSync(path.join(ROOT_DIR, 'extensions', 'ABM_Sphere_CMS_Bridge_v4_2_0.zip')),
                docsPresent: fs.existsSync(path.join(ROOT_DIR, 'docs', '01-discovery-and-prd.md'))
            }
        });
    }

    if (urlPath === '/api/docs' && req.method === 'GET') {
        const docsDir = path.join(ROOT_DIR, 'docs');
        let files = [];
        try {
            files = fs.readdirSync(docsDir).filter((f) => f.endsWith('.md')).sort();
        } catch (e) {}
        return sendJson(res, 200, {
            docs: files.map((f) => ({ name: f, url: `/docs/${f}` }))
        });
    }

    if (urlPath === '/api/audit' && req.method === 'GET') {
        return sendJson(res, 200, {
            count: auditEvents.length,
            events: auditEvents.slice(-50).reverse()
        });
    }

    if (urlPath === '/api/audit' && req.method === 'POST') {
        readJsonBody(req)
            .then((body) => {
                const actor = sanitizeText(body.actor, 60);
                const action = sanitizeText(body.action, 80);
                const status = sanitizeText(body.status, 32);
                const detail = sanitizeText(body.detail, 240);

                if (!actor || !action) {
                    return sendJson(res, 400, { error: 'Fields "actor" and "action" are required.' });
                }

                const entry = {
                    id: `evt_${Date.now()}_${auditEvents.length + 1}`,
                    timestamp: new Date().toISOString(),
                    actor,
                    action,
                    status: status || 'recorded',
                    detail
                };
                auditEvents.push(entry);
                if (auditEvents.length > AUDIT_MAX_ENTRIES) {
                    auditEvents.splice(0, auditEvents.length - AUDIT_MAX_ENTRIES);
                }
                return sendJson(res, 201, { ok: true, entry });
            })
            .catch((err) => {
                return sendJson(res, err.statusCode || 400, { error: err.message || 'Bad request' });
            });
        return;
    }

    return sendJson(res, 404, { error: 'API endpoint not found' });
}

function createServer() {
    return http.createServer((req, res) => {
        const rawUrl = (req.url || '/').split('?')[0];
        let urlPath;
        try {
            urlPath = decodeURIComponent(rawUrl);
        } catch (e) {
            return serve404(res, rawUrl);
        }

        if (urlPath.startsWith('/api/')) {
            return handleApi(req, res, urlPath);
        }

        if (req.method !== 'GET' && req.method !== 'HEAD') {
            applySecurityHeaders(res);
            res.writeHead(405, { 'Content-Type': 'application/json; charset=utf-8' });
            return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
        }

        const rel = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
        const filePath = path.resolve(ROOT_DIR, rel);

        // Block path traversal and hidden/server internals
        if (
            (filePath !== ROOT_DIR && !filePath.startsWith(ROOT_DIR + path.sep)) ||
            rel.startsWith('.') ||
            rel === 'server.js' ||
            rel === 'package.json' ||
            rel.startsWith('tests/') ||
            rel.startsWith('tests\\')
        ) {
            return serve404(res, urlPath);
        }

        fs.stat(filePath, (statErr, stats) => {
            if (statErr || !stats.isFile()) {
                return serve404(res, urlPath);
            }
            fs.readFile(filePath, (readErr, data) => {
                if (readErr) {
                    return serve404(res, urlPath);
                }
                applySecurityHeaders(res);
                const ext = path.extname(filePath).toLowerCase();
                res.writeHead(200, {
                    'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
                    'Cache-Control': ext === '.html' || ext === '.json' ? 'no-store' : 'public, max-age=3600'
                });
                if (req.method === 'HEAD') return res.end();
                res.end(data);
            });
        });
    });
}

if (require.main === module) {
    const server = createServer();
    server.listen(PORT, HOST, () => {
        console.log(`Listening on http://localhost:${PORT}`);
    });
}

module.exports = { createServer };
