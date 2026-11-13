// UI of the "Mémo" tab: one textarea, loaded from the server, saved when modified.
// Factory with injected document / fetch so it can be tested with jsdom.

function createMemoPanel({ root, doc, getUrl, updateUrl, fetchFn }) {
	let lastSaved = ''
	let textarea = null

	function ensureTextarea() {
		if (textarea) return textarea
		textarea = doc.createElement('textarea')
		textarea.className = 'form-control memo-text'
		textarea.setAttribute('aria-label', 'Mémo')
		textarea.placeholder = 'Votre mémo…'
		textarea.addEventListener('change', save)
		root.appendChild(textarea)
		return textarea
	}

	async function load() {
		const ta = ensureTextarea()
		try {
			const response = await fetchFn(getUrl, { method: 'GET' })
			if (response.ok) {
				ta.value = await response.text()
				lastSaved = ta.value
			}
		} catch (e) { /* offline: keep what is displayed */ }
	}

	async function save() {
		const value = textarea.value
		if (value === lastSaved) return
		lastSaved = value
		const formData = new FormData()
		// Encoded like the previous version: the server expects it
		formData.append('memo', encodeURIComponent(value))
		try {
			await fetchFn(updateUrl, { method: 'POST', body: formData })
		} catch (e) { /* will be re-sent on the next change */ lastSaved = '' }
	}

	return { load, save }
}

if (typeof module !== 'undefined') module.exports = { createMemoPanel }
