Use that :
```
cp env.example.js env.js
```

Fill env.js with your own API end points if you wanna use memo or password manager

Install on any chromium browser

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
