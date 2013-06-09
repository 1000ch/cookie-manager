/**
 * CookieManager
 * Easy to delete history and cookie.
 *
 * Copyright 1000ch<http://1000ch.net/>
 */
(function() {

//cache
var nativeForEach = [].forEach;
var nativeSlice = [].slice;

/**
 * Get unique id.
 * @return {Number}
 */
var generateUniqueId = (function() {
	var _cookieId = 0;
	return function() {
		++_cookieId;
	};
})();

/**
 * Throttle 
 * @description borrowed from UnderscoreJS
 * @param {Function} func
 * @param {Number} wait
 */
function throttle(fn, wait) {
	var context, args, timeout, result;
	var previous = 0;
	var later = function() {
		previous = new Date;
		timeout = null;
		result = fn.apply(context, args);
	};
	return function() {
		var now = new Date;
		var remaining = wait - (now - previous);
		context = this;
		args = arguments;
		if (remaining <= 0) {
			clearTimeout(timeout);
			timeout = null;
			previous = now;
			result = fn.apply(context, args);
		} else if (!timeout) {
			timeout = setTimeout(later, remaining);
		}
		return result;
	};
}

var CookieEntity = (function() {
	/**
	 * CookieEntity
	 * @param {Cookie} cookie
	 */
	var _CookieEntity = function(cookie) {
		this.cookieId = generateUniqueId();
		this.name = cookie.name;
		this.value = cookie.value;
		this.domain = cookie.domain;
		this.hostOnly = cookie.hostOnly;
		this.path = cookie.path;
		this.secure = cookie.secure;
		this.httpOnly = cookie.httpOnly;
		this.session = cookie.session;
		this.expirationDate = cookie.expirationDate;
		this.storeId = cookie.storeId;
	};
	_CookieEntity.prototype.url = function() {
		return "http" + (this.secure ? "s" : "") + "://" + this.domain + this.path;
	};
	_CookieEntity.prototype.completedDomain = function() {
		var completedDomain = this.domain + "";
		if(completedDomain.length && completedDomain.substring(0, 1) == ".") {
			completedDomain = "*" + completedDomain;
		}
		return completedDomain;
	};
	return _CookieEntity;
})();

var CookieCollection = (function() {
	/**
	 * CookieCollection
	 * @param {CookieCollection} collection
	 */
	var _CookieCollection = function(collection) {
		this.collection = nativeSlice.call(collection);
	};
	/**
	 * Get entity which matches given domain.
	 * @param {String} domain
	 */
	_CookieCollection.prototype.get = function(domain) {
		var cookieEntities = [];
		for(var i = 0, len = this.collection.length;i < len;i++) {
			cookieEntity = this.collection[i];
			if(cookieEntity.domain == domain) {
				cookieEntities.push(cookieEntity);
			}
		}
		return cookieEntities;
	};
	/**
	 * Remove entity from collection.
	 * @param {String} domain
	 */
	_CookieCollection.prototype.remove = function(cookieId) {
		var removeIndex = -1;
		var cookieEntity = null;
		for(var i = 0, len = this.collection.length;i < len;i++) {
			cookieEntity = this.collection[i];
			if(cookieEntity.cookieId == cookieId) {
				removeIndex = i;
				break;
			}
		}
		if(removeIndex != -1) {
			this.collection.splice(removeIndex, 1);
		}
	};
	return _CookieCollection;
})();

var CookieView = (function() {
	/**
	 * CookieView
	 * @{CookieCollection} cookieCollection
	 */
	var _CookieView = function(cookieCollection) {
		this.cookieCollection = cookieCollection;
	};
	/**
	 * Generate html string.
	 * @return {String}
	 */
	_CookieView.prototype.get = function() {
		var shownDomain = [];
		var html = "";
		var domain = "";
		this.cookieCollection.collection.forEach(function(cookieEntity) {
			domain = cookieEntity.domain;
			if(shownDomain.indexOf(domain) == -1) {
				shownDomain.push(domain);
				html += 
					"<li data-domain='" + domain +  "'>" +
						"<a href='" + cookieEntity.url() + "' target='_blank' class='breakAll'>" + cookieEntity.completedDomain() + "</a>" +
						"<button class='btn' data-domain='" + domain + "'>" + 
							"<i class='icon-remove'></i> DELETE" + 
						"</button>" + 
					"</li>";
			}
			
		});
		return html;
	};
	return _CookieView;
})();

/**
 * CookieAccessObject
 */
var CookieAccessObject = {
	/**
	 * Get cookie
	 * @param {Object} details
	 * @param {Function} callback
	 */
	get: function(details, callback) {
		chrome.cookies.get(details, callback);
	},
	/**
	 * Get cookies
	 * @param {Object} details
	 * @param {Function} callback
	 */
	getAll: function(details, callback) {
		chrome.cookies.getAll(details, callback);
	},
	/**
	 * Set cookie
	 * @param {Object} details
	 * @param {Function} callback
	 */
	set: function(details, callback) {
		chrome.cookies.set(details, callback);
	},
	/**
	 * Remove cookie
	 * @param {CookieEntity} entity
	 * @param {Function} callback
	 */
	remove: function(entity, callback) {
		chrome.cookies.remove({
			url: entity.url(),
			name: entity.name,
			storeId: entity.storeId
		}, callback);
	}
};

var container = null;
var alert = null;
var alertText = null;
var search = null;

var cookieView = null;
var cookieCollection = null;

function bindEventHandler() {
	container.on("mouseover", ".btn", function() {
		$(this).addClass("btn-danger").parent("li").addClass("active");
	}).on("mouseout", ".btn", function() {
		$(this).removeClass("btn-danger").parent("li").removeClass("active");
	});
}

function unbindEventHandler() {
	container.off("mouseover", ".btn").off("mouseout", ".btn");
}

function refreshEventBinding() {
	window.requestAnimationFrame(refreshEventBinding);

	unbindEventHandler();
	bindEventHandler();
}

//when document is ready, call init
$(document).ready(function() {
	container = $("#cookies");
	search = $("#search");

	CookieAccessObject.getAll({}, function(cookies) {
		var cookieArray = [];
		nativeForEach.call(cookies, function(cookie) {
			cookieArray.push(new CookieEntity(cookie));
		});
		cookieCollection = new CookieCollection(cookieArray);
		cookieView = new CookieView(cookieCollection);
		container.append(cookieView.get());
	});

	container.on("click", ".btn", function() {
		var btn = $(this);
		var clickedDomain = btn.attr("data-domain");
		var relatedCookies = cookieCollection.get(clickedDomain);

		//remove row
		btn.parent("li").remove();

		//remove cookies related with domain
		relatedCookies.forEach(function(relatedCookie) {
			CookieAccessObject.remove(relatedCookie, function(details) {
				console.log(details);
			});
		});
	});

	//setup mouseover/mouseout events
	window.requestAnimationFrame(refreshEventBinding);

	search.on("keyup", throttle(function() {
		var word = $(this).val();
		var row, domain;
		var rows = container.find("li");
		for(var i = 0, len = rows.length;i < len;i++) {
			row = rows[i];
			domain = row.getAttribute("data-domain") + "";
			if(domain.indexOf(word) == -1) {
				$(row).hide();
			} else {
				$(row).show();
			}
		}
	}, 1000));
});

})();
