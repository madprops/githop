browser.browserAction.onClicked.addListener(function (tab) {
	show_list()
})

function show_list() {
	browser.browserAction.openPopup()
}