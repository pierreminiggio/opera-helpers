function load() {

    let rightCol = document.querySelector('#rightCol');
    if (rightCol !== null) { rightCol.remove(); }

    // Redule left nav
    let pageletNavigation = document.querySelector('#pagelet_navigation');
    pageletNavigation.style.setProperty('position', 'fixed', 'important');
    pageletNavigation.style.setProperty('left', '20px', 'important');

    // Remove story card
    let fbStoriesCardRoot = document.querySelector('#fb_stories_card_root');
    if (fbStoriesCardRoot !== null) { fbStoriesCardRoot.remove(); }

    // Style main content
    let contentArea = document.querySelector('#contentArea');
    if (contentArea.style.position !== 'absolute') {
        contentArea.style.position = 'absolute';
        contentArea.style.left = '-50px';
        contentArea.style.setProperty('width', '100%', 'important');
    }

    // Remove useless chat trigger
    let fbDockChatBuddylistNub = document.querySelector('#fbDockChatBuddylistNub');
    if (fbDockChatBuddylistNub !== null) {
        fbDockChatBuddylistNub.style.setProperty('display', 'none', 'important');
    }
    loadImages();

    // Posts - Shadows
    let userContentWrapper = document.querySelectorAll('.userContentWrapper');
    [].forEach.call(userContentWrapper, function (elt) {
        elt.style.setProperty('box-shadow', '0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2)', 'important');
    });

}

function loadImages() {
    let uiScaledImageContainer = document.querySelectorAll('.uiScaledImageContainer');
    [].forEach.call(uiScaledImageContainer, function (elt) {
        elt.style.setProperty('width', 'inherit', 'important');
        elt.style.setProperty('height', 'inherit', 'important');
    });

    let otherImages = document.querySelectorAll('a._4-eo._2t9n');
    [].forEach.call(otherImages, function (elt) {
        elt.style.setProperty('width', '800px', 'important');
    });
}

(function () {
    if (window.location.href === "https://www.facebook.com/") {
        load();
        document.addEventListener('click', function (e) {
            setTimeout(load, 1000);
        });
        setInterval(loadImages, 1000);
    }
})();
