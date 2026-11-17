// Chrome has no "sidebar_action" (Opera only): its side panel is opened through the chrome.sidePanel API.
// Clicking the toolbar icon opens the panel. Opera has no chrome.sidePanel, so this does nothing there
// (Opera shows the panel from its own sidebar, declared by "sidebar_action" in manifest.json).
if (typeof chrome !== 'undefined' && chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
	chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(error => console.error(error))
}
