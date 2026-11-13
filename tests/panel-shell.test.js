// Tests of the tab shell and the static panel page.
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { JSDOM } = require('jsdom')
const { setupTabs } = require('../js/panel.js')

const html = fs.readFileSync(path.join(__dirname, '..', 'panel.html'), 'utf8')

test('panel.html has two tabs with matching panels, passwords active', () => {
	const doc = new JSDOM(html).window.document
	const tabs = [...doc.querySelectorAll('[role=tab]')]
	assert.equal(tabs.length, 2)
	for (const tab of tabs) assert.ok(doc.getElementById(tab.getAttribute('aria-controls')))
	assert.equal(tabs[0].getAttribute('aria-selected'), 'true')
	assert.equal(doc.getElementById(tabs[1].getAttribute('aria-controls')).hidden, true)
})

test('panel.html loads its own stylesheet and has no inline scripts', () => {
	const doc = new JSDOM(html).window.document
	assert.ok(doc.querySelector('link[href="./css/panel.css"]'))
	assert.equal([...doc.querySelectorAll('script')].filter(s => !s.src).length, 0)
})

test('clicking a tab selects it and shows only its panel', () => {
	const doc = new JSDOM(html).window.document
	const seen = []
	setupTabs(doc, id => seen.push(id))
	const tabs = [...doc.querySelectorAll('[role=tab]')]
	tabs[1].click()
	assert.equal(tabs[1].getAttribute('aria-selected'), 'true')
	assert.equal(tabs[0].getAttribute('aria-selected'), 'false')
	assert.equal(doc.getElementById(tabs[1].getAttribute('aria-controls')).hidden, false)
	assert.equal(doc.getElementById(tabs[0].getAttribute('aria-controls')).hidden, true)
	assert.deepEqual(seen, [tabs[1].getAttribute('aria-controls')])
})
