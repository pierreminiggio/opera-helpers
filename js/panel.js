// Bootstrap of the side panel: tab switching + wiring of the two panels.

function setupTabs(doc, onSelect) {
	const tabs = [...doc.querySelectorAll('[role=tab]')]
	function select(tab) {
		tabs.forEach(t => {
			const active = t === tab
			t.setAttribute('aria-selected', String(active))
			t.tabIndex = active ? 0 : -1
			doc.getElementById(t.getAttribute('aria-controls')).hidden = !active
		})
		if (onSelect) onSelect(tab.getAttribute('aria-controls'))
	}
	tabs.forEach((tab, i) => {
		tab.addEventListener('click', () => select(tab))
		tab.addEventListener('keydown', e => {
			const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
			if (!step) return
			const next = tabs[(i + step + tabs.length) % tabs.length]
			select(next)
			next.focus()
		})
	})
}

if (typeof module !== 'undefined') {
	module.exports = { setupTabs }
} else {
	// env.js (constants), password-api.js, password-panel.js and memo.js are loaded before this file
	const passwordsEnabled = typeof passwordLoginUrl !== 'undefined' && passwordLoginUrl && getPasswordsUrl
	const memoEnabled = typeof getMemoUrl !== 'undefined' && getMemoUrl && updateMemoUrl

	let passwords = null
	if (passwordsEnabled) {
		const api = createPasswordApi({
			loginUrl: passwordLoginUrl,
			logoutUrl: typeof passwordLogoutUrl !== 'undefined' ? passwordLogoutUrl : '',
			showUrl: getPasswordsUrl,
			storage: window.localStorage,
			fetchFn: (url, options) => fetch(url, options),
		})
		passwords = createPasswordPanel({
			root: document.getElementById('passwords-root'),
			api,
			doc: document,
			copyText: text => navigator.clipboard.writeText(text),
		})
	}

	let memo = null
	if (memoEnabled) {
		memo = createMemoPanel({
			root: document.getElementById('memo-root'),
			doc: document,
			getUrl: getMemoUrl,
			updateUrl: updateMemoUrl,
			fetchFn: (url, options) => fetch(url, options),
		})
	}

	// A tab whose feature is not configured in env.js is hidden
	if (!passwordsEnabled) document.getElementById('tab-passwords').hidden = true
	if (!memoEnabled) document.getElementById('tab-memo').hidden = true

	setupTabs(document, id => {
		if (id === 'panel-passwords' && passwords) passwords.refresh()
		if (id === 'panel-memo' && memo) memo.load()
	})
	if (passwords) passwords.refresh()
}
