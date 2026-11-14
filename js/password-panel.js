// UI of the "Mots de passe" tab: login form, folder/file tiles, breadcrumb, masked items.
// Everything coming from the server is inserted as text (never as HTML).
// Pure factory (document, api and clipboard are injected) so it can be tested with jsdom.

function createPasswordPanel({ root, api, doc, copyText }) {
	const LOGIN_ERRORS = {
		invalid: 'Identifiant ou mot de passe incorrect.',
		missing: 'Renseignez votre identifiant et votre mot de passe.',
		network: 'Impossible de joindre le serveur.',
		unavailable: 'Service momentanément indisponible, réessayez plus tard.',
	}

	function throttledMessage(retryAfter) {
		if (!(retryAfter > 0)) return 'Trop de tentatives, réessayez plus tard.'
		const minutes = Math.max(1, Math.ceil(retryAfter / 60))
		return 'Trop de tentatives, réessayez dans ' + minutes + (minutes === 1 ? ' minute.' : ' minutes.')
	}
	const SVG_NS = 'http://www.w3.org/2000/svg'
	const ICONS = {
		folder: ['M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'],
		file: ['M6 3h8l5 5v13H6z', 'M14 3v5h5'],
		home: ['M4 11l8-7 8 7', 'M6 10v10h12V10'],
	}
	let currentView = {} // { folder: id } or { file: id } or {} for the main folders

	function el(tag, className, text) {
		const node = doc.createElement(tag)
		if (className) node.className = className
		if (text !== undefined) node.textContent = text
		return node
	}

	function icon(name) {
		const svg = doc.createElementNS(SVG_NS, 'svg')
		svg.setAttribute('viewBox', '0 0 24 24')
		svg.setAttribute('class', 'icon icon-' + name)
		svg.setAttribute('aria-hidden', 'true')
		ICONS[name].forEach(d => {
			const p = doc.createElementNS(SVG_NS, 'path')
			p.setAttribute('d', d)
			svg.appendChild(p)
		})
		return svg
	}

	function button(className, text, onClick) {
		const b = el('button', className, text)
		b.type = 'button'
		b.addEventListener('click', onClick)
		return b
	}

	function clear() {
		while (root.firstChild) root.removeChild(root.firstChild)
	}

	function message(text, kind) {
		const m = el('div', kind === 'error' ? 'alert alert-danger' : 'message', text)
		if (kind === 'error') m.setAttribute('role', 'alert')
		return m
	}

	// ---- Login form ------------------------------------------------------------------------

	function renderLogin(errorText) {
		clear()
		const form = el('form', 'login-form')
		form.appendChild(el('h2', 'login-title', 'Connexion'))
		if (errorText) form.appendChild(message(errorText, 'error'))

		const email = el('input', 'form-control')
		email.type = 'email'
		email.placeholder = 'Identifiant (mail)'
		email.autocomplete = 'username'
		email.required = true
		email.setAttribute('aria-label', 'Identifiant (mail)')

		const password = el('input', 'form-control')
		password.type = 'password'
		password.placeholder = 'Mot de passe'
		password.autocomplete = 'current-password'
		password.required = true
		password.setAttribute('aria-label', 'Mot de passe')

		const submit = el('button', 'btn btn-primary', 'Se connecter')
		submit.type = 'submit'

		form.append(email, password, submit)
		form.addEventListener('submit', async function (e) {
			e.preventDefault()
			submit.disabled = true
			const result = await api.login(email.value.trim(), password.value)
			password.value = '' // the password is never kept
			if (result.ok) {
				refresh()
			} else {
				renderLogin(result.reason === 'throttled' ? throttledMessage(result.retryAfter) : (LOGIN_ERRORS[result.reason] || LOGIN_ERRORS.invalid))
			}
		})
		root.appendChild(form)
		email.focus()
	}

	// ---- Folders / files ---------------------------------------------------------------------

	function crumb(label, iconName, onClick, active) {
		const b = el('button', 'breadcrumb-item' + (active ? ' active' : ''))
		b.type = 'button'
		if (iconName) b.appendChild(icon(iconName))
		b.appendChild(doc.createTextNode(label))
		b.addEventListener('click', onClick)
		return b
	}

	function renderBreadcrumb(data) {
		const bar = el('div', 'topbar')
		const nav = el('nav', 'breadcrumb')
		nav.setAttribute('aria-label', 'Fil d\'Ariane')
		nav.appendChild(crumb('Accueil', 'home', () => load({})))
		const parents = data.folder.parents || []
		parents.forEach(f => nav.appendChild(crumb(f.libelle, 'folder', () => load({ folder: f.id_dossier }))))
		if (data.folder.infos !== undefined) {
			const f = data.folder.infos
			nav.appendChild(crumb(f.libelle, 'folder', () => load({ folder: f.id_dossier })))
		}
		if (data.file.infos.id_fichier !== undefined) {
			const f = data.file.infos
			nav.appendChild(crumb(f.libelle, 'file', () => load({ file: f.id_fichier }), true))
		}
		bar.appendChild(nav)
		bar.appendChild(button('logout btn-link', 'Déconnexion', async () => {
			await api.logout()
			renderLogin()
		}))
		return bar
	}

	function tile(kind, label, onClick) {
		const b = el('button', 'tile tile-' + kind)
		b.type = 'button'
		b.appendChild(icon(kind))
		b.appendChild(el('span', 'tile-label', label))
		b.addEventListener('click', onClick)
		return b
	}

	function itemRow(item) {
		const row = el('div', 'item-row')
		row.appendChild(el('div', 'item-label', item.libelle))
		const line = el('div', 'item-line')
		const input = el('input', 'form-control')
		input.type = 'password'
		input.readOnly = true
		input.value = item.content
		input.setAttribute('aria-label', item.libelle)
		const toggle = button('item-toggle btn-link', 'Afficher', () => {
			const hidden = input.type === 'password'
			input.type = hidden ? 'text' : 'password'
			toggle.textContent = hidden ? 'Masquer' : 'Afficher'
		})
		const copy = button('item-copy btn btn-primary', 'Copier', async () => {
			await copyText(item.content)
			copy.textContent = 'Copié ✓'
			setTimeout(() => { copy.textContent = 'Copier' }, 1500)
		})
		line.append(input, toggle, copy)
		row.appendChild(line)
		return row
	}

	function renderData(data) {
		clear()
		root.appendChild(renderBreadcrumb(data))
		const list = el('div', 'tiles')
		if (data.file.infos.id_fichier !== undefined) {
			data.file.items.forEach(item => list.appendChild(itemRow(item)))
			if (data.file.items.length === 0) list.appendChild(message('Ce fichier est vide.'))
		} else {
			data.folder.dossiers.forEach(f => list.appendChild(tile('folder', f.libelle, () => load({ folder: f.id_dossier }))))
			data.folder.fichiers.forEach(f => list.appendChild(tile('file', f.libelle, () => load({ file: f.id_fichier }))))
			if (list.children.length === 0) list.appendChild(message('Rien ici pour le moment.'))
		}
		root.appendChild(list)
	}

	// ---- Loading -----------------------------------------------------------------------------------

	async function load(view) {
		currentView = view
		clear()
		root.appendChild(message('Chargement…'))
		const result = await api.show(view)
		if (result.ok) {
			renderData(result.data)
		} else if (result.unauthorized) {
			renderLogin('Session expirée, reconnectez-vous.')
		} else if (result.forbidden) {
			clear()
			root.appendChild(message('Accès refusé.', 'error'))
			root.appendChild(button('btn btn-primary', 'Accueil', () => load({})))
		} else {
			clear()
			root.appendChild(message(LOGIN_ERRORS[result.reason] || LOGIN_ERRORS.unavailable, 'error'))
		}
	}

	function refresh() {
		if (api.isLoggedIn()) {
			return load(currentView)
		}
		renderLogin()
	}

	return { refresh, load }
}

if (typeof module !== 'undefined') module.exports = { createPasswordPanel }
