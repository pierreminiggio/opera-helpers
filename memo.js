(function() {
	var memo = document.querySelector('#memo-pierre');

	// Création memo
	if (memo === null) {
		memo = document.createElement('DIV');
		memo.id = 'memo-pierre';
		memo.innerHTML = 'test';
		memo.style.position = 'fixed';
		memo.style.top = '0';
		memo.style.right = '0';
		memo.style.zIndex = '999999';
		document.body.appendChild(memo);
	}
})();