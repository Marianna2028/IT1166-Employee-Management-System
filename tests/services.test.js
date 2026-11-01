'use strict'; const test = require('node:test'), assert = require('node:assert/strict'), svc = require('../scripts');
test('database uses synthetic example identities', async () => { const db = await svc.readDb(); assert.ok(db.employees.length > 0); assert.ok(db.employees.every(e => e.workEmail.endsWith('.test'))); assert.ok(db.employees.every(e => ['Demo', 'Sample', 'Test', 'Example'].includes(e.firstName))) });
test('employee IDs follow design', async () => { const db = await svc.readDb(); assert.ok(db.employees.every(e => /^EMP-[0-9]{4,}$/.test(e.employeeId))) });
