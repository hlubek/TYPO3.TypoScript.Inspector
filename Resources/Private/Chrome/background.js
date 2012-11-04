var callback;
chrome.extension.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.command == "parseDebugInformation") {
			chrome.tabs.executeScript(request.tab, {file: "zepto.js"});
			chrome.tabs.executeScript(request.tab, {file: "content-debugparser.js"});
				// FIXME Find a better way to store the callback function
				// until we get a result message from the content script
			callback = sendResponse;
		}

			// Result message from the content script
		if (request.result == "renderTree") {
			callback(request.tree);
		}

			// Forward messages from devtools panel to content script
		if (request.command == "highlightObject" || request.command == "unhighlightObject") {
			chrome.tabs.sendMessage(request.tab, request);
		}

		return true;
	});