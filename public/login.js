'use strict';
const form = document.querySelector('#loginForm'), error = document.querySelector('#loginError');
fetch('/api/session').then(r => { if (r.ok) location.replace('/dashboard') });
form.addEventListener('submit', async e => { e.preventDefault(); error.textContent = ''; const button = form.querySelector('button'); button.disabled = true; try { const r = await fetch('/api/session', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(form))) }); const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Sign in failed.'); location.replace(d.redirect || '/dashboard') } catch (x) { error.textContent = x.message; button.disabled = false } });
