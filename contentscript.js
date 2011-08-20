chrome.extension.sendRequest('getData', function(response) {
	var ignores = response.patterns.map(function(ignore){
		return new RegExp(ignore);
	});
	var nodesSnapshot = document.evaluate(
		'//a', document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	var side_image_hook = /^http:\/\/b\.hatena\.ne\.jp\/entry\//;
	for (var i = 0; i < nodesSnapshot.snapshotLength; ++ i) {
		var node = nodesSnapshot.snapshotItem(i);
		var href = node.href.replace(side_image_hook, 'http://');
		ignores.forEach(function(ignore){
			if (!href.match(ignore)) {
				return;
			}
			if ($(node).hasClass('entrylist-category-image-link')) {
				// side image
				$(node).addClass(response.looks);
				return;
			}
			var node_parent = node.parentNode;
			if (!node_parent) {
				return;
			}
			var node_parent_prev = node_parent.previousSibling;
			while (node_parent_prev &&
				   node_parent_prev.nodeType != Node.ELEMENT_NODE) {
				node_parent_prev = node_parent_prev.previousSibling;
			}
			if (node_parent_prev &&
				$(node_parent_prev).hasClass('entrylist-category-image-link')) {
				// titile of side image
				$(node_parent).addClass(response.looks);
				return;
			}
			var node_parent_parent = node_parent.parentNode;
			if ($(node_parent_parent).hasClass('entry-body')) {
				// general
				$(node_parent_parent).addClass(response.looks);
				return;
			}
			return;
		});
	}
});
