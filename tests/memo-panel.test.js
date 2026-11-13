const test = require('node:test')
const assert = require('node:assert/strict')
const { JSDOM } = require('jsdom')
const { createMemoPanel } = require('../js/memo.js')

function setup(text = 'hello') {
	const doc = new JSDOM('<body><div id="root"></div></body>').window.document
	const calls = []
	const fetchFn = async (url, options = {}) => {
		calls.push({ url, options })
		return { ok: true, status: 200, text: async () => text }
	}
	const panel = createMemoPanel({ root: doc.getElementById('root'), doc, getUrl: 'https://x/get', updateUrl: 'https://x/up', fetchFn })
	return { doc, calls, panel }
}
const tick = () => new Promise(r => setTimeout(r, 0))

test('load fills the textarea from the server', async () => {
	const { doc, panel, calls } = setup('my memo')
	await panel.load()
	assert.equal(doc.querySelector('textarea.memo-text').value, 'my memo')
	assert.equal(calls[0].url, 'https://x/get')
})

test('change posts the memo (url-encoded, as before) only when modified', async () => {
	const { doc, panel, calls } = setup('a b')
	await panel.load()
	const ta = doc.querySelector('textarea')
	ta.dispatchEvent(new doc.defaultView.Event('change'))
	await tick()
	assert.equal(calls.length, 1) // unchanged: no POST
	ta.value = 'new & text'
	ta.dispatchEvent(new doc.defaultView.Event('change'))
	await tick()
	assert.equal(calls.length, 2)
	assert.equal(calls[1].options.method, 'POST')
	assert.equal(calls[1].options.body.get('memo'), encodeURIComponent('new & text'))
})
