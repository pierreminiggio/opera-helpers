// The same folder is loaded by Opera (sidebar_action) and Chrome (side_panel): both entries must stay.
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const root = path.join(__dirname, '..')
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'))

test('manifest is MV3 (Chrome no longer loads MV2 extensions)', () => {
	assert.equal(manifest.manifest_version, 3)
	assert.equal(manifest.action.default_title, "Pierre's Helpers")
	assert.equal(manifest.browser_action, undefined)
})

test('the panel is declared for both Opera and Chrome', () => {
	assert.equal(manifest.sidebar_action.default_panel, 'panel.html')
	assert.equal(manifest.side_panel.default_path, 'panel.html')
	assert.ok(manifest.permissions.includes('sidePanel'))
	assert.equal(manifest.background.service_worker, 'background.js')
})

test('every file referenced by the manifest exists', () => {
	const files = [
		manifest.icons['128'],
		manifest.action.default_icon,
		manifest.sidebar_action.default_icon,
		manifest.sidebar_action.default_panel,
		manifest.side_panel.default_path,
		manifest.background.service_worker,
		...manifest.content_scripts.flatMap(cs => cs.css || []),
	]
	for (const file of files) assert.ok(fs.existsSync(path.join(root, file)), file + ' is missing')
})

test('background.js does not break without chrome.sidePanel (Opera)', () => {
	const code = fs.readFileSync(path.join(root, 'background.js'), 'utf8')
	assert.doesNotThrow(() => new Function('chrome', code)({}))
	let behavior = null
	new Function('chrome', code)({ sidePanel: { setPanelBehavior: async options => { behavior = options } } })
	assert.deepEqual(behavior, { openPanelOnActionClick: true })
})
