/**
 * Parse the rendering information from the DOM
 *
 * @return {Array} A list with debug information
 */
function buildRenderTree() {
	var result = [], count = 1;
	$('script[type="text/x-typoscript"]').each(function() {
		var $el = $(this),
			type = $el.attr('data-start') !== null ? 'start' : 'end';
		// Create a unique identifier for each marker
		$el.attr('id', 'typoscript-debug-' + count);
		result.push({type: type, path: $el.attr('data-path'), id: 'typoscript-debug-' + count, class: $el.attr('data-class')})
		count++;
	});
	return result;
}

// Send the rendering information back to the devtools panel
chrome.extension.sendMessage({result: "renderTree", tree: buildRenderTree()});
// React on messages for highlighting or unhighlighting elements rendered by a TypoScript object
chrome.extension.onMessage.addListener(
	function(request) {
		if (request.command == "highlightObject") {
			var startMarker, elements, offset, overlay;
				// Find the start and end of the debug marker
			startMarker = $('script#' + request.id);
			// endMarker = $('script[type="text/x-typoscript"][data-path="' + request.path + '"][data-end]');
			if (startMarker) {
				// TODO Add all elements until endMarker
				elements = startMarker.next();
				offset = elements.offset();
				overlay = $('<div id="typo3-typoscript-browser-overlay"></div>');
				overlay.css($.extend({
					position: 'absolute',
					background: 'rgba(255,135,0,0.25)',
					outline: '4px solid rgba(255,135,0,0.4)'
				}, offset));
				$('body').append(overlay);
			}
		} else if (request.command == "unhighlightObject") {
			$('#typo3-typoscript-browser-overlay').remove();
		}
		return true;
	}
);
