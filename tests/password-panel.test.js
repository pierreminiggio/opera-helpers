// Tests of the password panel UI (jsdom). Run: npm test
const test = require('node:test')
const assert = require('node:assert/strict')
const { JSDOM } = require('jsdom')
const { createPasswordPanel } = require('../js/password-panel.js')

function setup(apiOverrides = {}) {
	const dom = new JSDOM('<!doctype html><body><div id="root"></div></body>')
	const doc = dom.window.document
	const root = doc.getElementById('root')
	const copied = []
	const calls = { show: [], login: [], logout: 0 }
	const api = {
		isLoggedIn: () => true,
		login: async (e, p) => { calls.login.push([e, p]); return { ok: true } },
		logout: async () => { calls.logout++ },
		show: async () => ({ ok: true, data: HOME }),
		...apiOverrides,
	}
	const rawShow = api.show
	api.show = async view => { calls.show.push(view); return rawShow(view) }
	const panel = createPasswordPanel({ root, api, doc, copyText: async t => { copied.push(t) } })
	return { dom, doc, root, api, calls, copied, panel }
}
const tick = () => new Promise(r => setTimeout(r, 0))

const HOME = {
	folder: { dossiers: [{ id_dossier: 1, libelle: 'Banque' }], fichiers: [{ id_fichier: 9, libelle: 'Wifi' }] },
	file: { infos: {} },
}
const FILE = {
	folder: { parents: [{ id_dossier: 1, libelle: 'Banque' }], infos: { id_dossier: 2, libelle: 'Perso' }, dossiers: [], fichiers: [] },
	file: { infos: { id_fichier: 9, libelle: 'Wifi' }, items: [{ libelle: 'Mot de passe', content: 's3cret' }, { libelle: 'Login', content: 'pierre' }] },
}

test('shows the login form when logged out', async () => {
	const { root, panel } = setup({ isLoggedIn: () => false })
	panel.refresh()
	assert.ok(root.querySelector('form.login-form'))
	assert.equal(root.querySelector('input[type=password]').autocomplete, 'current-password')
	assert.equal(root.querySelector('button[type=submit]').classList.contains('btn-primary'), true)
})

test('lists folders and files as tiles', async () => {
	const { root, panel } = setup()
	panel.refresh(); await tick()
	const tiles = [...root.querySelectorAll('.tile')]
	assert.deepEqual(tiles.map(t => t.textContent.trim()), ['Banque', 'Wifi'])
	assert.ok(tiles[0].classList.contains('tile-folder'))
	assert.ok(tiles[1].classList.contains('tile-file'))
	assert.ok(tiles[0].querySelector('svg'))
})

test('clicking a folder loads it', async () => {
	const { root, panel, calls } = setup()
	panel.refresh(); await tick()
	root.querySelector('.tile-folder').click(); await tick()
	assert.deepEqual(calls.show.at(-1), { folder: 1 })
})

test('breadcrumb has home, parents, folder and file; home reloads the root', async () => {
	const { root, panel, calls } = setup({ show: async () => ({ ok: true, data: FILE }) })
	panel.refresh(); await tick()
	const items = [...root.querySelectorAll('.breadcrumb-item')].map(i => i.textContent.trim())
	assert.deepEqual(items, ['Accueil', 'Banque', 'Perso', 'Wifi'])
	root.querySelector('.breadcrumb-item').click(); await tick()
	assert.deepEqual(calls.show.at(-1), {})
})

test('items are masked by default; show/hide toggles; copy copies the real value', async () => {
	const { root, panel, copied } = setup({ show: async () => ({ ok: true, data: FILE }) })
	panel.refresh(); await tick()
	const rows = [...root.querySelectorAll('.item-row')]
	assert.equal(rows.length, 2)
	const input = rows[0].querySelector('input')
	assert.equal(input.type, 'password')
	assert.equal(input.readOnly, true)
	rows[0].querySelector('.item-toggle').click()
	assert.equal(input.type, 'text')
	rows[0].querySelector('.item-toggle').click()
	assert.equal(input.type, 'password')
	rows[1].querySelector('.item-copy').click(); await tick()
	assert.deepEqual(copied, ['pierre'])
	assert.ok(rows[1].querySelector('.item-copy').textContent.includes('Copié'))
})

test('server data is inserted as text, never as HTML', async () => {
	const evil = '<img src=x onerror="window.pwned=1">'
	const data = { folder: { dossiers: [{ id_dossier: 1, libelle: evil }], fichiers: [] }, file: { infos: {} } }
	const { root, panel, dom } = setup({ show: async () => ({ ok: true, data }) })
	panel.refresh(); await tick()
	assert.equal(root.querySelector('img'), null)
	assert.ok(root.textContent.includes(evil))
	assert.equal(dom.window.pwned, undefined)
})

test('expired session shows the form with a message', async () => {
	const { root, panel } = setup({ show: async () => ({ unauthorized: true }) })
	panel.refresh(); await tick()
	assert.ok(root.querySelector('form.login-form'))
	assert.ok(root.querySelector('.alert-danger').textContent.includes('Session expirée'))
})

test('login failure shows an error and clears the password field', async () => {
	const { root, panel } = setup({ isLoggedIn: () => false, login: async () => ({ ok: false, reason: 'invalid' }) })
	panel.refresh()
	root.querySelector('input[type=email]').value = 'a@b.fr'
	root.querySelector('input[type=password]').value = 'x'
	root.querySelector('form').dispatchEvent(new root.ownerDocument.defaultView.Event('submit', { cancelable: true })); await tick()
	assert.ok(root.querySelector('.alert-danger').textContent.includes('incorrect'))
	assert.equal(root.querySelector('input[type=password]').value, '')
})

test('login success loads the folders; logout returns to the form', async () => {
	let logged = false
	const { root, panel, calls } = setup({ isLoggedIn: () => logged, login: async () => { logged = true; return { ok: true } } })
	panel.refresh()
	root.querySelector('input[type=email]').value = 'a@b.fr'
	root.querySelector('input[type=password]').value = 'x'
	root.querySelector('form').dispatchEvent(new root.ownerDocument.defaultView.Event('submit', { cancelable: true })); await tick(); await tick()
	assert.ok(root.querySelector('.tile'))
	root.querySelector('.logout').click(); await tick()
	assert.equal(calls.logout, 1)
	assert.ok(root.querySelector('form.login-form'))
})
