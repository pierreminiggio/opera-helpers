/**
 * Client of the mdp API.
 *
 * Flow: login(email, password) -> POST (JSON body, never the URL) -> the server answers with an access token ->
 * only that token is kept (never the password) and sent as "Authorization: Bearer <token>" afterwards.
 * A 401 means the token expired or was revoked: it is forgotten and the panel shows the login form again.
 */
(function (root) {
	'use strict'

	const STORAGE_KEY = 'mdp-api-session'

	function createPasswordApi({ loginUrl, logoutUrl, showUrl, storage, fetchFn }) {
		function readSession() {
			try {
				const session = JSON.parse(storage.getItem(STORAGE_KEY))
				return session && typeof session.token === 'string' && session.token !== '' ? session : null
			} catch (e) {
				return null
			}
		}

		function writeSession(session) {
			try { storage.setItem(STORAGE_KEY, JSON.stringify(session)) } catch (e) { /* storage unavailable: logged in for this panel only */ }
		}

		function clearSession() {
			try { storage.removeItem(STORAGE_KEY) } catch (e) { /* nothing to clear */ }
		}

		async function parse(response) {
			try { return await response.json() } catch (e) { return {} }
		}

		function isLoggedIn() {
			return readSession() !== null
		}

		async function login(email, password) {
			if (!email || !password) {
				return { ok: false, reason: 'missing' }
			}
			let response
			try {
				response = await fetchFn(loginUrl, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					credentials: 'omit',
					body: JSON.stringify({ login: email, password: password, label: 'Pierre\'s Helpers' }),
				})
			} catch (e) {
				return { ok: false, reason: 'network' }
			}
			const body = await parse(response)
			if (response.status === 401) return { ok: false, reason: 'invalid', message: body.error }
			if (response.status >= 500) return { ok: false, reason: 'unavailable', message: body.error }
			if (!response.ok || typeof body.token !== 'string' || body.token === '') {
				return { ok: false, reason: 'invalid', message: body.error }
			}
			writeSession({ token: body.token, expires_at: body.expires_at })
			return { ok: true }
		}

		async function show(params = {}) {
			const session = readSession()
			if (!session) {
				return { ok: false, unauthorized: true }
			}
			const query = new URLSearchParams()
			Object.keys(params).forEach(key => {
				if (params[key] !== undefined && params[key] !== null && params[key] !== '') query.set(key, params[key])
			})
			const queryString = query.toString()
			let response
			try {
				response = await fetchFn(showUrl + (queryString ? '?' + queryString : ''), {
					method: 'GET',
					headers: { Authorization: 'Bearer ' + session.token },
					credentials: 'omit',
				})
			} catch (e) {
				return { ok: false, reason: 'network' }
			}
			if (response.status === 401) {
				clearSession()
				return { ok: false, unauthorized: true }
			}
			if (response.status === 403) return { ok: false, forbidden: true }
			if (!response.ok) return { ok: false, reason: 'unavailable' }
			return { ok: true, data: await parse(response) }
		}

		async function logout() {
			const session = readSession()
			if (session && logoutUrl) {
				try {
					await fetchFn(logoutUrl, {
						method: 'POST',
						headers: { Authorization: 'Bearer ' + session.token },
						credentials: 'omit',
					})
				} catch (e) { /* the token is dropped locally anyway */ }
			}
			clearSession()
			return { ok: true }
		}

		return { isLoggedIn, login, show, logout }
	}

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = { createPasswordApi }
	} else {
		root.createPasswordApi = createPasswordApi
	}
})(typeof window !== 'undefined' ? window : globalThis)
