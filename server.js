'use strict';
const path = require('node:path'); const crypto = require('node:crypto'); const express = require('express'); const session = require('express-session'); const helmet = require('helmet'); const svc = require('./scripts');
const app = express(), PORT = Number(process.env.PORT || 3000), HOST = '127.0.0.1';
app.disable('x-powered-by'); app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'"], imgSrc: ["'self'", "data:"], objectSrc: ["'none'"], baseUri: ["'none'"], frameAncestors: ["'none'"] } } })); app.use(express.json({ limit: '20kb' })); app.use(express.urlencoded({ extended: false, limit: '20kb' }));
app.use(session({ name: 'ems.sid', secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'), resave: false, saveUninitialized: false, rolling: true, cookie: { httpOnly: true, sameSite: 'strict', secure: false, maxAge: 30 * 60 * 1000 } }));
function requireAuth(req, res, next) { if (!req.session.actor) return res.status(401).json({ error: 'Authentication required.' }); req.actor = req.session.actor; next() }
function csrf(req, res, next) { if (!req.session.csrf || req.get('x-csrf-token') !== req.session.csrf) return res.status(403).json({ error: 'Invalid request token.' }); next() }
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
app.get('/', (req, res) => { if (req.session.actor) return res.redirect('/dashboard'); res.sendFile(path.join(__dirname, 'public', 'index.html')) });
app.get('/dashboard', (req, res) => { if (!req.session.actor) return res.redirect('/'); res.sendFile(path.join(__dirname, 'public', 'index.html')) });
app.use('/assets', express.static(path.join(__dirname, 'public'), { index: false, dotfiles: 'deny', fallthrough: false, maxAge: 0 }));
app.post('/api/session', wrap(async (req, res) => { const actor = await svc.authenticate(req.body.username, req.body.password); req.session.regenerate(err => { if (err) return res.status(500).json({ error: 'Unable to create session.' }); req.session.actor = actor; req.session.csrf = crypto.randomBytes(24).toString('hex'); res.json({ actor, redirect: '/dashboard' }) }) }));
app.get('/api/session', (req, res) => { if (!req.session.actor) return res.status(401).json({ error: 'Authentication required.' }); res.json({ actor: req.session.actor, csrfToken: req.session.csrf }) });
app.delete('/api/session', requireAuth, csrf, (req, res) => req.session.destroy(() => res.status(204).end()));
app.get('/api/employees', requireAuth, wrap(async (req, res) => res.json(await svc.directory(req.actor, req.query))));
app.get('/api/employees/:id', requireAuth, wrap(async (req, res) => res.json(await svc.getEmployee(req.actor, req.params.id))));
app.post('/api/employees', requireAuth, csrf, wrap(async (req, res) => res.status(201).json(await svc.createEmployee(req.actor, req.body))));
app.patch('/api/employees/:id', requireAuth, csrf, wrap(async (req, res) => res.json(await svc.updateEmployee(req.actor, req.params.id, req.body))));
app.get('/api/leave-requests', requireAuth, wrap(async (req, res) => res.json(await svc.getLeave(req.actor))));
app.post('/api/leave-requests', requireAuth, csrf, wrap(async (req, res) => res.status(201).json(await svc.submitLeave(req.actor, req.body))));
app.patch('/api/leave-requests/:id/decision', requireAuth, csrf, wrap(async (req, res) => res.json(await svc.decideLeave(req.actor, req.params.id, req.body))));
app.get('/api/attendance', requireAuth, wrap(async (req, res) => res.json(await svc.getAttendance(req.actor, req.query))));
app.post('/api/attendance', requireAuth, csrf, wrap(async (req, res) => res.status(201).json(await svc.addAttendance(req.actor, req.body))));
app.get('/api/reports/headcount', requireAuth, wrap(async (req, res) => res.json(await svc.headcount(req.actor))));
app.get('/api/audit-events', requireAuth, wrap(async (req, res) => res.json(await svc.auditReport(req.actor))));
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api', (req, res) => res.status(404).json({ error: 'Route not found.' }));
app.use((err, req, res, next) => { const id = crypto.randomUUID(); console.error(`[${id}]`, err.message); res.status(err.status || 500).json({ error: err.status ? err.message : 'Unexpected server error.', correlationId: id }) });
svc.seedUsers().then(() => app.listen(PORT, HOST, () => console.log(`Employee Management System: http://${HOST}:${PORT}`))).catch(e => { console.error(e); process.exit(1) });
