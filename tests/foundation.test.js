'use strict';

const assert = require('assert');
const http = require('http');
const { createServer } = require('../server');

function request(port, method, reqPath, body = null) {
    return new Promise((resolve, reject) => {
        const headers = {};
        let payload = null;
        if (body !== null) {
            payload = typeof body === 'string' ? body : JSON.stringify(body);
            headers['Content-Type'] = 'application/json';
            headers['Content-Length'] = Buffer.byteLength(payload);
        }
        const req = http.request({ hostname: '127.0.0.1', port, path: reqPath, method, headers }, (res) => {
            const chunks = [];
            res.on('data', (c) => chunks.push(c));
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: Buffer.concat(chunks).toString('utf8')
                });
            });
        });
        req.on('error', reject);
        if (payload !== null) req.write(payload);
        req.end();
    });
}

(async () => {
    const server = createServer();
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address();

    try {
        // 1. Home page, security headers, SEO & accessibility landmarks
        const home = await request(port, 'GET', '/');
        assert.strictEqual(home.status, 200);
        assert.strictEqual(home.headers['x-content-type-options'], 'nosniff');
        assert.strictEqual(home.headers['x-frame-options'], 'SAMEORIGIN');
        assert(home.headers['content-security-policy'], 'CSP header missing');
        assert(home.body.includes('<meta name="description"'), 'Meta description missing');
        assert(home.body.includes('property="og:title"'), 'Open Graph title missing');
        assert(home.body.includes('class="skip-link"'), 'Skip link missing');
        assert(home.body.includes('<main id="main-content"'), 'Semantic <main> landmark missing');
        assert(home.body.includes('prefers-reduced-motion'), 'Reduced-motion support missing');
        console.log('PASS: Home page, security headers, SEO & WCAG accessibility checks');

        // 2. Health endpoint
        const health = await request(port, 'GET', '/api/health');
        assert.strictEqual(health.status, 200);
        const healthJson = JSON.parse(health.body);
        assert.strictEqual(healthJson.status, 'ok');
        assert.strictEqual(healthJson.checks.indexHtml, true);
        assert.strictEqual(healthJson.checks.notFoundPage, true);
        assert.strictEqual(healthJson.checks.extensionBundle, true);
        assert.strictEqual(healthJson.checks.docsPresent, true);
        console.log('PASS: GET /api/health returns ok with all asset checks true');

        // 3. Docs endpoint
        const docs = await request(port, 'GET', '/api/docs');
        assert.strictEqual(docs.status, 200);
        const docsJson = JSON.parse(docs.body);
        assert(Array.isArray(docsJson.docs) && docsJson.docs.length >= 6, 'Expected 6 foundation docs');
        console.log('PASS: GET /api/docs lists all foundation documents');

        // 4. Audit API validation & persistence
        const badAudit = await request(port, 'POST', '/api/audit', { actor: '' });
        assert.strictEqual(badAudit.status, 400);

        const goodAudit = await request(port, 'POST', '/api/audit', {
            actor: 'QA_Runner',
            action: 'FOUNDATION_TEST',
            status: 'verified',
            detail: 'Automated integration test check'
        });
        assert.strictEqual(goodAudit.status, 201);
        const auditList = await request(port, 'GET', '/api/audit');
        assert.strictEqual(auditList.status, 200);
        const auditJson = JSON.parse(auditList.body);
        assert(auditJson.events.some((e) => e.action === 'FOUNDATION_TEST'), 'Audit event not persisted');
        console.log('PASS: POST/GET /api/audit validation & telemetry persistence');

        // 5. SEO files (robots.txt & sitemap.xml)
        const robots = await request(port, 'GET', '/robots.txt');
        assert.strictEqual(robots.status, 200);
        assert(robots.body.includes('Sitemap:'), 'robots.txt missing Sitemap');
        const sitemap = await request(port, 'GET', '/sitemap.xml');
        assert.strictEqual(sitemap.status, 200);
        assert(sitemap.body.includes('<urlset'), 'sitemap.xml invalid');
        console.log('PASS: robots.txt and sitemap.xml served cleanly');

        // 6. Custom 404 recovery & traversal protection
        const notFound = await request(port, 'GET', '/does-not-exist-route');
        assert.strictEqual(notFound.status, 404);
        assert(notFound.body.includes('Route Not Found'), 'Custom 404 recovery content missing');
        const blocked = await request(port, 'GET', '/server.js');
        assert.strictEqual(blocked.status, 404);
        console.log('PASS: Custom 404 recovery page and internal file protection');

        // 7. Extension zip download
        const ext = await request(port, 'GET', '/extensions/ABM_Sphere_CMS_Bridge_v4_2_0.zip');
        assert.strictEqual(ext.status, 200);
        assert.strictEqual(ext.headers['content-type'], 'application/zip');
        console.log('PASS: Extension zip served with application/zip MIME');
    } finally {
        await new Promise((resolve) => server.close(resolve));
    }
})();
