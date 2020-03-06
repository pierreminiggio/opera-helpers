if (passwordLoginUrl && getPasswordsUrl) {
	
	let lastPasswordRequest = getPasswordsUrl;

    (function() {

        function fillpassword(elt) {
			password.innerHTML = 'Chargement...'
			
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
							password.innerHTML = fileRequest.responseText
						}
					}
					fileRequest.open('GET', lastPasswordRequest, true)
					fileRequest.send()
                }
			}
			loginRequest.open('GET', passwordLoginUrl, true)
            loginRequest.send()
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
