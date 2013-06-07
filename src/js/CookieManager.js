/**
 * CookieManager
 * Easy to delete history and cookie.
 *
 * Copyright 1000ch<http://1000ch.net/>
 */

//cache
var nativeForEach = [].forEach;
var nativeSlice = [].slice;

/**
 * CookieEntity
 * @param {Cookie} cookie
 */
var CookieEntity = function(cookie) {
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
CookieEntity.prototype.url = function() {
	return "http" + (this.secure ? "s" : "") + "://" + this.domain + this.path;
};
/**
 * CookieCollection
 * @param {CookieCollection} collection
 */
var CookieCollection = function(collection) {
	this.collection = nativeSlice.call(collection);
	/**
	 * Get entity which matches given domain.
	 * @param {String} domain
	 */
	this.get = function(domain) {
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
	this.remove = function(cookieId) {
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
};
/**
 * CookieView
 * @{CookieCollection} cookieCollection
 */
var CookieView = function(cookieCollection) {
	this.cookieCollection = cookieCollection;
	/**
	 * Generate html string.
	 * @return {String}
	 */
	this.get = function() {
		var shownDomain = [];
		var html = "";
		nativeForEach.call(this.cookieCollection.collection, function(cookieEntity) {
			if(shownDomain.indexOf(cookieEntity.domain) == -1) {
				shownDomain.push(cookieEntity.domain);
				html += 
					"<tr id='" + cookieEntity.cookieId +  "''>" +
						"<td style='word-break: break-all;'>" + cookieEntity.domain + "</td>" +
						"<td>" + "<button class='btn' data-cookie-domain='" + cookieEntity.domain + "'>DELETE</button>" + "</td>" +
					"</tr>";
			}
			
		});
		return html;
	};
};
/**
 * CookieAccessObject
 */
var CookieAccessObject = function() {
	/**
	 * Get cookies with GoogleChromeAPI.
	 * @param {Object} param
	 * @param {Function} callback
	 */
	this.get = function(param, callback) {
		chrome.cookies.getAll(param, callback);
	};
	/**
	 * Remove cookie.
	 * @param {CookieEntity} entity
	 * @param {Function} callback
	 */
	this.remove = function(entity, callback) {
		var param = {
			url: entity.url(),
			name: entity.name,
			storeId: entity.storeId
		};
		chrome.cookies.remove(param, callback);
	};
};

var _cookieId = 0;
function generateUniqueId() {
	return ++_cookieId;
};

var container = null;
var alert = null;
var search = null;
var cookieAccessObject = new CookieAccessObject();

var cookieView = null;
var cookieCollection = null;

//when document is ready, call init
$(document).ready(function() {
	container = $("#cookie-list");
	alert = $("#alert");
	cookieAccessObject.get({}, function(cookies) {
		var cookieArray = [];
		nativeForEach.call(cookies, function(cookie) {
			cookieArray.push(new CookieEntity(cookie));
		});
		cookieCollection = new CookieCollection(cookieArray);
		cookieView = new CookieView(cookieCollection);
		container.append(cookieView.get());
	});
}).on("click", ".btn", function() {
	var btn = $(this);
	var clickedDomain = btn.attr("data-cookie-domain");
	var clickedCookieEntityArray = cookieCollection.get(clickedDomain);

	//remove row
	btn.parents("tr").remove();

	//remove cookies related with domain
	nativeForEach.call(clickedCookieEntityArray, function(clickedCookieEntity) {
		cookieAccessObject.remove(clickedCookieEntity, function(details) {
			console.log(details);
		});
	});
	alert.html("cookie of " + clickedDomain + " has been removed successfilly.");
});


