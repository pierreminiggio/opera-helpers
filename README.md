Use that :
```
cp env.example.js env.js
```

Fill env.js with your own API end points if you wanna use memo or password manager

Install on any chromium browser (`opera://extensions` or `chrome://extensions` -> developer mode -> "Load unpacked" on this folder).

The same folder works on both, with Manifest V3:
- **Opera**: the panel lives in the sidebar (`sidebar_action`), as before.
- **Chrome**: click the extension icon to open the panel (`side_panel` + `background.js`, Chrome 114+).

Chrome may list "Unrecognized manifest key 'sidebar_action'" in the extension's errors, and Opera may do the same for
`side_panel` / the `sidePanel` permission: these are harmless, each browser ignores the other one's entry.

## Passwords login

The 🔑 panel asks for your mdp email + password once (POST to `passwordLoginUrl`), then only keeps an
access token (in the extension's local storage, valid 30 days, revoked by "Déconnexion"). Your password is
never stored and never put in a URL. The credentials that used to live in `env.js`
(`?creds=…`) are not needed anymore: remove them.

## Tests

```
npm install   # once: installs jsdom (dev only, used by the UI tests)
npm test
```
(Node 18+.)

## Panel layout

The side panel (`panel.html`) mirrors the mdp website: blue gradient banner, two tabs (Mots de passe / Mémo),
tiles for folders and files, masked items with Afficher/Copier. Styles: `css/panel.css` (fonts in `fonts/`, Roboto, SIL OFL).
A tab whose URLs are not set in `env.js` is hidden.
