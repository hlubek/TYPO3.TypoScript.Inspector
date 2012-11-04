/*
 * TypoScript rendering inspector panel
 */

var tabId = chrome.devtools.inspectedWindow.tabId;

chrome.devtools.inspectedWindow.onResourceAdded.addListener(function(resource) {
		// FIXME Find a better way of detecting a page reload of the tab
	if (resource.type === 'document') {
		console.log('Possible page reload');
		inspectPage();
	}
});

/**
 * Build a tree outline of the rendering debug information
 *
 * Very simplistic implementation with no expand / collapse and simple event
 * handling through Zepto.
 *
 * @param debugInformation
 */
function buildRenderTree(debugInformation) {
	var browser = $('#typoscript-browser'),
		container,
		depth = 0;

	browser.empty();
	container = $('<ol tabindex="0"></ol>');
	debugInformation.forEach(function(debugEntry) {
		var listElement;
		if (debugEntry.type === 'start') {
			depth++;
			if (container.is('li')) {
				container.addClass('expanded').addClass('parent');
				container = $('<ol></ol>').insertAfter(container);
			}
			pathParts = debugEntry.path.split('/');
			listElement = $('<li></li>').text(pathParts[pathParts.length - 1]).attr('data-path', debugEntry.path).attr('data-markerid', debugEntry.id);
				// Selection spacer for tree outline
			listElement.prepend($('<div class="selection selected" style="height: 13px; "></div>'));
			container.append(listElement);

			container = listElement;
		} else {
			depth--;
			container = container.parent();
		}
	});

	browser.append(container);

	browser.on('mouseover', 'li', function() {
			$(this).addClass('hovered');
			chrome.extension.sendMessage({command: "highlightObject", tab: tabId, id: $(this).attr('data-markerid')});
		}).on('mouseout', 'li', function() {
			$(this).removeClass('hovered');
			chrome.extension.sendMessage({command: "unhighlightObject", tab: tabId, id: $(this).attr('data-markerid')});
		}).on('click', 'li', function() {
			browser.find('li.selected').removeClass('selected');
			$(this).addClass('selected');
		});
}

/**
 * Send a message to the background page for executing a content script to
 * parse TypoScript debug information, the background page will respond after
 * a result message from the content script.
 * The script can only be injected through the background page because of Chrome
 * security restrictions in devtools.
 */
function inspectPage() {
	chrome.extension.sendMessage({command: "parseDebugInformation", tab: tabId}, function(response) {
		buildRenderTree(response);
	});
}

	// Do an initial load of the page
inspectPage();