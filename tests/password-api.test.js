// Tests of the API client used by the password panel. Run: npm test (Node 18+, no dependency).
const test = require('node:test')
const assert = require('node:assert/strict')
const { createPasswordApi } = require('../js/password-api.js')

const URLS = {
	loginUrl: 'https://example.fr/api/login/',
	logoutUrl: 'https://example.fr/api/logout/',
	showUrl: 'https://example.fr/api/show/',
}

function memoryStorage(initial = {}) {
	const data = { ...initial }
	return {
		getItem: k => (k in data ? data[k] : null),
		setItem: (k, v) => { data[k] = String(v) },
		removeItem: k => { delete data[k] },
		dump: () => data,
	}
}

/** fetch fake: answers with the queued responses and records the calls. */
function fakeFetch(...responses) {
	const calls = []
	const fn = async (url, options = {}) => {
		calls.push({ url, options })
		const r = responses.shift()
		if (r instanceof Error) throw r
		return { ok: r.status >= 200 && r.status < 300, status: r.status, json: async () => r.body }
	}
	fn.calls = calls
	return fn
}

function api(fetchFn, storage = memoryStorage()) {
	return { api: createPasswordApi({ ...URLS, storage, fetchFn }), storage }
}

test('login sends the credentials in a POST JSON body, never in the URL', async () => {
	const f = fakeFetch({ status: 200, body: { logged: 1, token: 'tok', expires_at: '2030-01-01 00:00:00' } })
	const { api: a } = api(f)
	const r = await a.login('me@example.fr', 's3cret & more')
	assert.equal(r.ok, true)
	assert.equal(f.calls.length, 1)
	const { url, options } = f.calls[0]
	assert.equal(url, URLS.loginUrl)
	assert.ok(!url.includes('?') && !url.includes('s3cret') && !url.includes('me@'))
	assert.equal(options.method, 'POST')
	assert.equal(options.headers['Content-Type'], 'application/json')
	assert.deepEqual(JSON.parse(options.body), { login: 'me@example.fr', password: 's3cret & more', label: JSON.parse(options.body).label })
	assert.ok(typeof JSON.parse(options.body).label === 'string')
})

test('login keeps only the token, never the password, and sends no cookies', async () => {
	const f = fakeFetch({ status: 200, body: { logged: 1, token: 'tok123', expires_at: 'x' } })
	const { api: a, storage } = api(f)
	await a.login('me@example.fr', 'topsecret')
	assert.equal(a.isLoggedIn(), true)
	assert.ok(!JSON.stringify(storage.dump()).includes('topsecret'))
	assert.ok(JSON.stringify(storage.dump()).includes('tok123'))
	assert.equal(f.calls[0].options.credentials, 'omit')
})

test('wrong credentials: not logged in, a readable reason, nothing stored', async () => {
	const { api: a, storage } = api(fakeFetch({ status: 401, body: { logged: 0, error: 'Identifiant ou mot de passe incorrect' } }))
	const r = await a.login('me@example.fr', 'nope')
	assert.deepEqual([r.ok, r.reason], [false, 'invalid'])
	assert.equal(a.isLoggedIn(), false)
	assert.deepEqual(storage.dump(), {})
})

test('network failure, unavailable service and missing fields are told apart', async () => {
	assert.equal((await api(fakeFetch(new TypeError('Failed to fetch'))).api.login('a', 'b')).reason, 'network')
	assert.equal((await api(fakeFetch({ status: 503, body: { error: 'x' } })).api.login('a', 'b')).reason, 'unavailable')
	const f = fakeFetch()
	assert.equal((await api(f).api.login('', 'b')).reason, 'missing')
	assert.equal(f.calls.length, 0, 'nothing is sent when a field is empty')
})

test('a 200 answer without token is not a login', async () => {
	const { api: a } = api(fakeFetch({ status: 200, body: { logged: 1 } }))
	assert.equal((await a.login('a', 'b')).ok, false)
	assert.equal(a.isLoggedIn(), false)
})

test('show sends the token in the Authorization header and builds the query safely', async () => {
	const f = fakeFetch({ status: 200, body: { folder: { dossiers: [] }, file: { infos: [] } } })
	const { api: a } = api(f, memoryStorage({ 'mdp-api-session': JSON.stringify({ token: 'tok123' }) }))
	const r = await a.show({ folder: 4, file: 'a&b=c' })
	assert.equal(r.ok, true)
	assert.deepEqual(r.data, { folder: { dossiers: [] }, file: { infos: [] } })
	const { url, options } = f.calls[0]
	assert.equal(url, 'https://example.fr/api/show/?folder=4&file=a%26b%3Dc')
	assert.equal(options.headers.Authorization, 'Bearer tok123')
	assert.ok(!url.includes('tok123'), 'the token never goes in the URL')
	assert.equal(options.method, 'GET')
	assert.equal(options.credentials, 'omit')
})

test('show without parameters asks for the main folders', async () => {
	const f = fakeFetch({ status: 200, body: {} })
	await api(f, memoryStorage({ 'mdp-api-session': JSON.stringify({ token: 't' }) })).api.show()
	assert.equal(f.calls[0].url, 'https://example.fr/api/show/')
})

test('show without being logged in does not even call the server', async () => {
	const f = fakeFetch()
	const r = await api(f).api.show()
	assert.deepEqual([r.ok, r.unauthorized], [false, true])
	assert.equal(f.calls.length, 0)
})

test('a 401 from the server forgets the token so the login form comes back', async () => {
	const { api: a, storage } = api(fakeFetch({ status: 401, body: { error: 'Veuillez vous connecter.' } }), memoryStorage({ 'mdp-api-session': JSON.stringify({ token: 'old' }) }))
	const r = await a.show()
	assert.equal(r.unauthorized, true)
	assert.equal(a.isLoggedIn(), false)
	assert.deepEqual(storage.dump(), {})
})

test('403 and network errors keep the session', async () => {
	const s = memoryStorage({ 'mdp-api-session': JSON.stringify({ token: 'ok' }) })
	const r403 = await api(fakeFetch({ status: 403, body: { error: 'Droits insuffisants' } }), s).api.show({ folder: 9 })
	assert.deepEqual([r403.ok, r403.forbidden], [false, true])
	const rNet = await api(fakeFetch(new TypeError('offline')), s).api.show()
	assert.deepEqual([rNet.ok, rNet.reason], [false, 'network'])
	assert.ok(createPasswordApi({ ...URLS, storage: s, fetchFn: fakeFetch() }).isLoggedIn(), 'still logged in')
})

test('logout revokes the token on the server and always clears it locally', async () => {
	const f = fakeFetch({ status: 200, body: { logged: 0 } })
	const { api: a, storage } = api(f, memoryStorage({ 'mdp-api-session': JSON.stringify({ token: 'tok123' }) }))
	await a.logout()
	assert.equal(f.calls[0].url, URLS.logoutUrl)
	assert.equal(f.calls[0].options.method, 'POST')
	assert.equal(f.calls[0].options.headers.Authorization, 'Bearer tok123')
	assert.deepEqual(storage.dump(), {})

	const { api: b, storage: s2 } = api(fakeFetch(new TypeError('offline')), memoryStorage({ 'mdp-api-session': JSON.stringify({ token: 'tok' }) }))
	await b.logout()
	assert.deepEqual(s2.dump(), {}, 'cleared even when the server cannot be reached')
})

test('a broken or missing storage does not crash the client', async () => {
	const throwing = { getItem() { throw new Error('denied') }, setItem() { throw new Error('denied') }, removeItem() { throw new Error('denied') } }
	const a = createPasswordApi({ ...URLS, storage: throwing, fetchFn: fakeFetch({ status: 200, body: { token: 't' } }) })
	assert.equal(a.isLoggedIn(), false)
	await a.login('a', 'b')
})

test('corrupted stored data counts as logged out', () => {
	const { api: a } = api(fakeFetch(), memoryStorage({ 'mdp-api-session': '{not json' }))
	assert.equal(a.isLoggedIn(), false)
})
