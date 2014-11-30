function updataBadgeText(a){
	chrome.browserAction.setBadgeText({text: ""+a});
}
function reportNumTabs() {
	chrome.windows.getAll({populate:!0}, function(a) {
		var b = 0;
		a.forEach(function(a) {
			a.tabs&&(b+=a.tabs.length)
		}
		);
		updataBadgeText(b);
	});
}
reportNumTabs();
chrome.tabs.onCreated.addListener(function (a) {
	reportNumTabs();
});
chrome.tabs.onRemoved.addListener(function (a) {
	reportNumTabs();
});
// chrome.commands.onCommand.addListener(function(command) {
// 	alert('command: ' + command);
// });

