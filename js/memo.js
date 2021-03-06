if (getMemoUrl && updateMemoUrl) {
	var lastMemoText = ''

	function autosize(elt) {
		setTimeout(function() {
			elt.style.height = 'auto'
			elt.style.height = Math.min(elt.scrollHeight, 500) + 'px'
		}, 0)
	}

	function fillMemo(elt) {
		let txt = ''
		const fileRequest = new XMLHttpRequest()
		fileRequest.onreadystatechange = function() {
			if(fileRequest.status == 200 && fileRequest.readyState == 4) {
				txt = fileRequest.responseText
				elt.value = txt
				lastMemoText = txt
			}
		}
		fileRequest.open('GET', getMemoUrl, true)
		fileRequest.send()
	}

	function updateMemo(value) {
		const fileRequest = new XMLHttpRequest()
		fileRequest.open('POST', updateMemoUrl, true)
		const formData = new FormData()
		formData.append('memo', value)
		fileRequest.send(formData)
	}

	(function() {

		// Création memo
		let memo = document.querySelector('#memo-pierre')
		if (memo === null) {
			memo = document.createElement('TEXTAREA')
			memo.id = 'memo-pierre'
			memo.style.width = '100%'
			memo.style.color = '#fff'
			memo.style.backgroundColor = '#000'
			memo.style.opacity = '.6'
			memo.style.transition = '.5s'
			memo.style.display = 'none'
			document.body.appendChild(memo)

			// Events
			memo.addEventListener('mouseover', function(e) {
				this.style.opacity = '1'
				memoTrigger.style.opacity = '1'
			})

			memo.addEventListener('mouseleave', function(e) {
				this.style.opacity = '.6'
				memoTrigger.style.opacity = '.6'
			})

			memo.addEventListener('keydown', function(e) {
				autosize(this)
			})

			memo.addEventListener('change', function(e) {
				const encodedValue = encodeURIComponent(this.value)
				if (encodedValue !== lastMemoText) {
					lastMemoText = encodedValue
					updateMemo(encodedValue)
				}
			})
		}

		// Création memo trigger
		let memoTrigger = document.querySelector('#memo-trigger-pierre')
		if (memoTrigger === null) {

			memoTrigger = document.createElement('DIV')

			// Properties
			memoTrigger.id = 'memo-trigger-pierre'
			memoTrigger.innerHTML = '🖉'
			memoTrigger.style.textAlign = 'center'
			memoTrigger.title = 'Memo'
			memoTrigger.style.color = '#fff'
			memoTrigger.style.backgroundColor = '#000'
			memoTrigger.style.height = '30px'
			memoTrigger.style.lineHeight = '30px'
			memoTrigger.style.width = '30px'
			memoTrigger.style.fontSize = '20px'
			memoTrigger.style.borderRadius = '50%'
			memoTrigger.style.userSelect = 'none'
			
			memoTrigger.style.cursor = 'pointer'
			memoTrigger.style.opacity = '.6'
			memoTrigger.style.transition = '.5s'

			// Events
			memoTrigger.addEventListener('mouseover', function(e) {
				this.style.opacity = '1'
			})

			memoTrigger.addEventListener('mouseleave', function(e) {
				this.style.opacity = '.6'
			})

			memoTrigger.addEventListener('click', function(e) {
				let newDisplayState = 'none'
				if (memo.style.display === 'none') {
					newDisplayState = 'block'
				}
				memo.style.display = newDisplayState

				if (newDisplayState === 'block') {
					fillMemo(memo)
					setTimeout(function() {
						autosize(memo)
					}, 500)
				}
			})

			document.body.appendChild(memoTrigger)
		}
	})()
}
