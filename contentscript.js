chrome.extension.sendRequest('getPatterns', function(response) {
	var ignores = [];
	response.split("\n").forEach(function(ignore){
		if (!ignore.match("^\s*$")) {
			ignores.push(ignore);
		}
	});
	var nodesSnapshot = document.evaluate(
		'//a', document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	for (var i = 0; i < nodesSnapshot.snapshotLength; ++ i) {
		var node = nodesSnapshot.snapshotItem(i);
		ignores.forEach(function(ignore){
			if (node.href.match(ignore)) {
				$(node.parentNode.parentNode).addClass('ignore');
			}
		});
	}
});
