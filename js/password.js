if (passwordLoginUrl && getPasswordsUrl) {

	(function() {

		// Client of the mdp API (see js/password-api.js): login with email + password, then a token is used
		const api = createPasswordApi({
			loginUrl: passwordLoginUrl,
			logoutUrl: typeof passwordLogoutUrl !== 'undefined' ? passwordLogoutUrl : '',
			showUrl: getPasswordsUrl,
			storage: window.localStorage,
			fetchFn: (url, options) => fetch(url, options),
		})

		let currentView = {} // { folder: id } or { file: id } or {} for the main folders

		// Everything coming from the server is inserted as text (never as HTML)
		function el(tag, text, style) {
			const node = document.createElement(tag)
			if (text !== undefined) node.textContent = text
			if (style) Object.assign(node.style, style)
			return node
		}

		function link(text, onClick) {
			const a = el('a', text, { display: 'inline-block', padding: '5px', cursor: 'pointer' })
			a.addEventListener('click', function (e) {
				e.preventDefault()
				onClick()
			})
			return a
		}

		function renderMessage(elt, message) {
			elt.innerHTML = ''
			elt.appendChild(el('div', message, { padding: '5px' }))
		}

		// ---- Login form ---------------------------------------------------------------------

		const LOGIN_ERRORS = {
			invalid: 'Identifiant ou mot de passe incorrect.',
			missing: 'Renseignez votre identifiant et votre mot de passe.',
			network: 'Impossible de joindre le serveur.',
			unavailable: 'Service momentanément indisponible, réessayez plus tard.',
		}

		function renderLogin(elt, message) {
			elt.innerHTML = ''

			const form = el('form', undefined, { padding: '5px' })
			if (message) form.appendChild(el('div', message, { marginBottom: '10px', color: '#ffb4b4' }))

			const email = el('input', undefined, { display: 'block', width: '90%', marginBottom: '8px' })
			email.type = 'email'
			email.placeholder = 'Identifiant (mail)'
			email.autocomplete = 'username'
			email.required = true

			const password = el('input', undefined, { display: 'block', width: '90%', marginBottom: '8px' })
			password.type = 'password'
			password.placeholder = 'Mot de passe'
			password.autocomplete = 'current-password'
			password.required = true

			const submit = el('button', 'Se connecter')
			submit.type = 'submit'

			form.appendChild(email)
			form.appendChild(password)
			form.appendChild(submit)

			form.addEventListener('submit', async function (e) {
				e.preventDefault()
				submit.disabled = true
				const result = await api.login(email.value.trim(), password.value)
				password.value = '' // the password is never kept
				if (result.ok) {
					refresh(elt)
				} else {
					renderLogin(elt, LOGIN_ERRORS[result.reason] || LOGIN_ERRORS.invalid)
				}
			})

			elt.appendChild(form)
			email.focus()
		}

		// ---- Folders / files ---------------------------------------------------------------------

		function renderData(elt, data) {
			elt.innerHTML = ''

			const parentsDiv = el('div', undefined, { borderBottom: '1px #555 solid', marginBottom: '10px' })

			const crumbs = [link('🏠Accueil', () => load(elt, {}))]
			if (data.folder.parents !== undefined) {
				data.folder.parents.forEach(folder => crumbs.push(folderLink(elt, folder)))
			}
			if (data.folder.infos !== undefined) {
				crumbs.push(folderLink(elt, data.folder.infos))
			}
			if (data.file.infos.id_fichier !== undefined) {
				crumbs.push(fileLink(elt, data.file.infos))
			}
			crumbs.forEach((crumb, index) => {
				parentsDiv.appendChild(crumb)
				if (index < crumbs.length - 1) parentsDiv.appendChild(el('span', '>', { marginLeft: '10px' }))
			})
			parentsDiv.appendChild(link('Déconnexion', async () => {
				await api.logout()
				renderLogin(elt)
			})).style.float = 'right'
			elt.appendChild(parentsDiv)

			const container = el('div')
			if (data.file.infos.id_fichier !== undefined) {
				data.file.items.forEach(item => container.appendChild(itemRow(item)))
			} else {
				data.folder.dossiers.forEach(folder => container.appendChild(folderLink(elt, folder)))
				data.folder.fichiers.forEach(file => container.appendChild(fileLink(elt, file)))
			}
			elt.appendChild(container)
		}

		function folderLink(elt, folder) {
			return link('📁' + folder.libelle, () => load(elt, { folder: folder.id_dossier }))
		}

		function fileLink(elt, file) {
			return link('📝' + file.libelle, () => load(elt, { file: file.id_fichier }))
		}

		function itemRow(item) {
			const row = el('div', item.libelle + ': ', { display: 'block', padding: '5px' })
			const input = el('input')
			input.type = 'text'
			input.value = item.content
			row.appendChild(input)
			return row
		}

		// ---- Loading ----------------------------------------------------------------------------------

		async function load(elt, view) {
			currentView = view
			renderMessage(elt, 'Chargement...')
			const result = await api.show(view)
			if (result.ok) {
				renderData(elt, result.data)
			} else if (result.unauthorized) {
				renderLogin(elt, 'Session expirée, reconnectez-vous.')
			} else if (result.forbidden) {
				renderMessage(elt, 'Accès refusé.')
				elt.appendChild(link('🏠Accueil', () => load(elt, {})))
			} else {
				renderMessage(elt, LOGIN_ERRORS[result.reason] || LOGIN_ERRORS.unavailable)
			}
		}

		function refresh(elt) {
			if (api.isLoggedIn()) {
				load(elt, currentView)
			} else {
				renderLogin(elt)
			}
		}

        // Création password
		let password = document.querySelector('#password-pierre')
		if (password === null) {
			password = document.createElement('div')
			password.id = 'password-pierre'
			password.style.width = '100%'
			password.style.color = '#fff'
			password.style.backgroundColor = '#000'
			password.style.opacity = '.6'
			password.style.transition = '.5s'
			password.style.display = 'none'
			document.body.appendChild(password)

			// Events
			password.addEventListener('mouseover', function(e) {
				this.style.opacity = '1'
				passwordTrigger.style.opacity = '1'
			})

			password.addEventListener('mouseleave', function(e) {
				this.style.opacity = '.6'
				passwordTrigger.style.opacity = '.6'
			})
		}

        // Création password trigger
		let passwordTrigger = document.querySelector('#password-trigger-pierre')
		if (passwordTrigger === null) {

			passwordTrigger = document.createElement('DIV')

			// Properties
			passwordTrigger.id = 'password-trigger-pierre'
			passwordTrigger.innerHTML = '🔑'
			passwordTrigger.style.textAlign = 'center'
			passwordTrigger.title = 'Mots de passe'
			passwordTrigger.style.zIndex = '999999'
			passwordTrigger.style.color = '#fff'
			passwordTrigger.style.backgroundColor = '#000'
			passwordTrigger.style.height = '30px'
			passwordTrigger.style.lineHeight = '30px'
			passwordTrigger.style.width = '30px'
			passwordTrigger.style.fontSize = '20px'
			passwordTrigger.style.borderRadius = '50%'
			passwordTrigger.style.userSelect = 'none'
			
			passwordTrigger.style.cursor = 'pointer'
			passwordTrigger.style.opacity = '.6'
			passwordTrigger.style.transition = '.5s'

			// Events
			passwordTrigger.addEventListener('mouseover', function(e) {
				this.style.opacity = '1'
			})

			passwordTrigger.addEventListener('mouseleave', function(e) {
				this.style.opacity = '.6'
			})

			passwordTrigger.addEventListener('click', function(e) {
				let newDisplayState = 'none'
				if (password.style.display === 'none') {
					newDisplayState = 'block'
				}
				password.style.display = newDisplayState

				if (newDisplayState === 'block') {
					refresh(password)
				}
			})

			document.body.appendChild(passwordTrigger)
		}
    })()
}
