var DEFAULT_URL = 'http://wedata.net/databases/HatenaBookmarkMitakunaiLinkDefault/items.json';
var CACHE_EXPIRE = 24 * 60 * 60 * 1000;

window.onload = init;

var g_caches = { };

function init() {
	if (localStorage['defaults']) {
		localStorage.removeItem('defaults')
	}
	if (!localStorage['patterns']) {
		localStorage['patterns'] = "";
	}
	if (!localStorage['looks']) {
		localStorage['looks'] = 'hidden';
	}
	if (!localStorage['patterns_srcs']) {
		localStorage['patterns_srcs'] = DEFAULT_URL + "\n";
	}
	if (!localStorage['caches']) {
		localStorage['caches'] = "{}";
	}
	if (localStorage['use-default'] === undefined) {
		localStorage['use-default'] = "true";
	}
	g_caches = JSON.parse(localStorage['caches']);
	chrome.extension.onRequest.addListener(onRequest);
	refresh();
}

function onRequest(request, sender, sendResponse) {
	switch (request) {
	case 'refresh':
		refresh(true, sendResponse);
		break;
	case 'getData':
		refresh();
		var patterns = { };
		localStorage['patterns'].split("\n").forEach(function(url){
			if (!url.match("^\s*$")) {
				patterns[url] = true;
			}
		});
		if (localStorage['use-default'] == "true") {
			for (var src in g_caches) {
				Object.keys(g_caches[src].urls).forEach(function(url){
					patterns[url] = true;
				});
			}
		}
		sendResponse({
			"patterns": Object.keys(patterns),
			"looks": localStorage['looks']
		});
		break;
	}
}

function httpGET(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            callback(xhr);
        }
    }
    xhr.open('GET', url, true);
    xhr.send(null);
    return xhr;
}

function refresh(force, sendResponse) {
	if (!sendResponse) {
		sendResponse = function () { };
	}
	g_caches = JSON.parse(localStorage['caches']);
	var caches = { };
	localStorage['patterns_srcs'].split("\n").forEach(function(src){
		if (!src.match("^\s*$")) {
			caches[src] = ((src in g_caches) ? g_caches[src] : 
						   { "expire": 0, "urls": { } });
		}
	});
	g_caches = caches;
	localStorage['caches'] = JSON.stringify(g_caches);
	var now = new Date();
	for (var src in g_caches) {
		var cache = g_caches[src];
		if (force || !cache.expire || new Date(cache.expire) < now) {
			try {
				httpGET(src, function(res){
					sendResponse(refresh_response(src, res));
				});
			} catch (e) {
			}
		}
	}
}

function refresh_response(src, res) {
	if (res.status != 200) {
		return false;
	}
	var wedata = JSON.parse(res.responseText);
	if (wedata.length == 0) {
		return false;
	}
	if (!g_caches[src]) {
		return false;
	}
	var new_cache = {
	  expire: new Date().getTime() + CACHE_EXPIRE,
	  urls: { }
	};
	var count = 0;
	wedata.forEach(function(wedata_item){
		if (wedata_item.data && wedata_item.data.url) {
			var pattern = { };
			new_cache.urls[wedata_item.data.url] = pattern;
			pattern.type = (wedata_item.data.type || "H");
			count = count + 1;
		}
	});
	if (count == 0) {
		return false;
	}
	g_caches[src] = new_cache;
	localStorage['caches'] = JSON.stringify(g_caches);
	return  true;
}
