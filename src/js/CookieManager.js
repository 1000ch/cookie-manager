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
		var selectedCookieEntities = [];
		for(var i = 0, len = this.collection.length;i < len;i++) {
			cookieEntity = this.collection[i];
			if(cookieEntity.domain == domain) {
				selectedCookieEntities.push(cookieEntity);
			}
		}
		return selectedCookieEntities;
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
		this.cookieCollection.collection.forEach(function(cookieEntity) {
			if(shownDomain.indexOf(cookieEntity.domain) == -1) {
				shownDomain.push(cookieEntity.domain);
				html += 
					"<tr data-cookie-domain='" + cookieEntity.domain +  "'>" +
						"<td style='word-break: break-all;'>" + 
							cookieEntity.domain + 
						"</td>" +
						"<td>" + 
							"<button class='btn btn-block' data-cookie-domain='" + cookieEntity.domain + "'>DELETE</button>" + 
						"</td>" +
					"</tr>";
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
	 * Get cookies with GoogleChromeAPI.
	 * @param {Object} param
	 * @param {Function} callback
	 */
	get: function(param, callback) {
		chrome.cookies.getAll(param, callback);
	},
	/**
	 * Remove cookie.
	 * @param {CookieEntity} entity
	 * @param {Function} callback
	 */
	remove: function(entity, callback) {
		var param = {
			url: entity.url(),
			name: entity.name,
			storeId: entity.storeId
		};
		chrome.cookies.remove(param, callback);
	}
};

var container = null;
var alert = null;
var search = null;

var cookieView = null;
var cookieCollection = null;

//when document is ready, call init
$(document).ready(function() {
	container = $("#cookie-list");
	alert = $("#alert").hide();
	search = $("#search");

	CookieAccessObject.get({}, function(cookies) {
		var cookieArray = [];
		nativeForEach.call(cookies, function(cookie) {
			cookieArray.push(new CookieEntity(cookie));
		});
		cookieCollection = new CookieCollection(cookieArray);
		cookieView = new CookieView(cookieCollection);
		container.append(cookieView.get());
	});

	container.on("mouseover", ".btn", function() {
		$(this).addClass("btn-danger");
	}).on("mouseout", ".btn", function() {
		$(this).removeClass("btn-danger");
	}).on("click", ".btn", function() {
		var btn = $(this);
		var clickedDomain = btn.attr("data-cookie-domain");
		var relatedCookies = cookieCollection.get(clickedDomain);

		//remove row
		btn.parents("tr").remove();

		//remove cookies related with domain
		relatedCookies.forEach(function(relatedCookie) {
			CookieAccessObject.remove(relatedCookie, function(details) {
				console.log(details);
			});
		});
		alert.html(clickedDomain + " cookies have been removed successfully.");
	});

	search.on("keyup", function() {
		var word = $(this).val();
		var rows = container.find("tr");
		rows.each(function() {
			var domain = this.getAttribute("data-cookie-domain") + "";
			if(domain.indexOf(word) == -1) {
				$(this).hide();
			} else {
				$(this).show();
			}
		});
	});
});

})();
