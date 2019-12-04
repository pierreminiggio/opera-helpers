function load() {
	if (window.location.href === 'https://www.facebook.com/') {

		// Remove right side
		var rightCol = document.querySelector('#rightCol');
		if (rightCol !== null) {
			rightCol.remove();
		}

		// Redule left nav
		var pageletNavigation = document.querySelector('#pagelet_navigation');
		pageletNavigation.style.setProperty('position', 'fixed', 'important');
		pageletNavigation.style.setProperty('left', '20px', 'important');

		// Remove story card
		var fbStoriesCardRoot = document.querySelector('#fb_stories_card_root');
		if (fbStoriesCardRoot !== null) {
			fbStoriesCardRoot.remove();
		}

		// Style main content
		var contentArea = document.querySelector('#contentArea');
		if (contentArea.style.position !== 'absolute') {
			contentArea.style.position = 'absolute';
			contentArea.style.left = '-50px';
			contentArea.style.setProperty('width', '100%', 'important');
		}

		// Remove useless chat trigger
		var fbDockChatBuddylistNub = document.querySelector('#fbDockChatBuddylistNub');
		if (fbDockChatBuddylistNub !== null) {
			fbDockChatBuddylistNub.style.setProperty('display', 'none', 'important');
		}

		// Background-color
		var backgrounds = document.querySelectorAll('._5vb_, ._5vb_ #contentCol');
		[].forEach.call(backgrounds, function(elt) {
			elt.style.setProperty('background-color', '#F2CB7C', 'important');
		});
	}

	loadImages();
	
}

function loadImages() {
	if (window.location.href === 'https://www.facebook.com/') {
		var uiScaledImageContainer = document.querySelectorAll('.uiScaledImageContainer');
		[].forEach.call(uiScaledImageContainer, function(elt) {
			elt.style.setProperty('width', 'inherit', 'important');
			elt.style.setProperty('height', 'inherit', 'important');
		});

		var otherImages = document.querySelectorAll('a._4-eo._2t9n');
		[].forEach.call(otherImages, function(elt) {
			elt.style.setProperty('width', '800px', 'important');
		});
		
	}
}

(function() {

	load();
	document.addEventListener('click', function (e) {
		setTimeout(load, 1000);
	});

	setInterval(loadImages, 1000);
	
})();