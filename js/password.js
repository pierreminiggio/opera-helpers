if (passwordLoginUrl && getPasswordsUrl) {
	
	let lastPasswordRequest = getPasswordsUrl;

    (function() {

		function renderData(elt, data) {
			elt.innerHTML = ''

			const parentsDiv = document.createElement('div')
			parentsDiv.style.borderBottom = '1px #555 solid'
			parentsDiv.style.marginBottom = '10px'

			parentsDiv.appendChild(renderAccueil(elt))

			if (data.folder.parents !== undefined) {
				renderFolders(elt, data.folder.parents, parentsDiv)
			}

			if (data.folder.infos !== undefined) {
				renderFolders(elt, [data.folder.infos], parentsDiv)
			}

			if (data.file.infos.id_fichier !== undefined) {
				renderFiles(elt, [data.file.infos], parentsDiv)
			}

			elt.appendChild(parentsDiv)

			parentsDiv.childNodes.forEach(breadcrumb => {
				if (breadcrumb && breadcrumb !== parentsDiv.children[parentsDiv.children.length-1]) {
					breadcrumb.innerHTML += '<span style="margin-left: 10px;">></span>'
				}
			})
			
			const container = document.createElement('div')

			if (data.file.infos.id_fichier !== undefined) {
				renderItems(elt, data.file.items, container)
			} else {
				renderFolders(elt, data.folder.dossiers, container)
				renderFiles(elt, data.folder.fichiers, container)
			}

			

			elt.appendChild(container)
		}

		function renderAccueil(elt) {
			const accueil = document.createElement('a')
			accueil.innerHTML = '🏠Accueil'
			accueil.style.display = 'inline-block'
			accueil.style.padding = '5px'
			accueil.addEventListener('click', function (e) {
				e.preventDefault()
				changePasswordView(elt, getPasswordsUrl)
			})

			return accueil
		}

		function renderFolders(elt, folders, foldersContainer) {
			folders.forEach(folder => {
				let folderLink = document.createElement('a')
				folderLink.innerHTML = '📁' + folder.libelle
				folderLink.style.display = 'inline-block'
				folderLink.style.padding = '5px'
				folderLink.addEventListener('click', function (e) {
					e.preventDefault()
					changePasswordView(elt, getPasswordsUrl + '?folder=' + folder.id_dossier)
				})
				foldersContainer.appendChild(folderLink)
			});
		}

		function renderFiles(elt, files, filesContainer) {
			files.forEach(file => {
				let fileLink = document.createElement('a')
				fileLink.innerHTML = '📝' + file.libelle
				fileLink.style.display = 'inline-block'
				fileLink.style.padding = '5px'
				fileLink.addEventListener('click', function (e) {
					e.preventDefault()
					changePasswordView(elt, getPasswordsUrl + '?file=' + file.id_fichier)
				})
				filesContainer.appendChild(fileLink)
			});
		}

		function renderItems(elt, items, itemsContainer) {
			items.forEach(item => {
				let itemContainer = document.createElement('div')
				itemContainer.innerHTML = item.libelle + `: <input
					type="text"
					value="` + item.content + `"
				>`
				itemContainer.style.display = 'block'
				itemContainer.style.padding = '5px'
				itemsContainer.appendChild(itemContainer)
			});
		}

        function fillpassword(elt) {
			elt.innerHTML = 'Chargement...'
			
			const loginRequest = new XMLHttpRequest()
			loginRequest.onreadystatechange = () => {
				if (
					loginRequest.status == 200
					&& loginRequest.readyState == 4
					&& JSON.parse(loginRequest.responseText)['logged'] == 1
				) {
                    const fileRequest = new XMLHttpRequest()
					fileRequest.onreadystatechange = () => {
						if (fileRequest.status == 200 && fileRequest.readyState == 4) {
							renderData(elt, JSON.parse(fileRequest.responseText))
						}
					}
					fileRequest.open('GET', lastPasswordRequest, true)
					fileRequest.send()
                }
			}
			loginRequest.open('GET', passwordLoginUrl, true)
            loginRequest.send()
		}
		
		function changePasswordView(elt, newLink) {
			lastPasswordRequest = newLink
			fillpassword(elt)
		}

        // Création password
		let password = document.querySelector('#password-pierre')
		if (password === null) {
			password = document.createElement('div')
			password.id = 'password-pierre'
			password.style.position = 'fixed'
			password.style.top = '30%'
			password.style.right = '100px'
			password.style.width = '400px'
			password.style.zIndex = '999999'
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
			passwordTrigger.style.position = 'fixed'
			passwordTrigger.innerHTML = '🔑'
			passwordTrigger.style.textAlign = 'center'
			passwordTrigger.title = 'Mots de passe'
			passwordTrigger.style.top = '35%'
			passwordTrigger.style.right = '20px'
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
					fillpassword(password)
				}
			})

			document.body.appendChild(passwordTrigger)
		}
    })()

}
