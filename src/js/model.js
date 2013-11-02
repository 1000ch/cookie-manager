/**
 * Get unique id.
 * @returns {Number}
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
  function Entity(cookie) {
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
  }
  /**
   * get completed url
   * @returns {String}
   */
  Entity.prototype.url = function() {
    return "http" + (this.secure ? "s" : "") + "://" + this.domain + this.path;
  };
  /**
   * get completed domain
   * @returns {String}
   */
  Entity.prototype.completedDomain = function() {
    var completedDomain = this.domain + "";
    if(completedDomain.length && completedDomain.substring(0, 1) == ".") {
      completedDomain = "*" + completedDomain;
    }
    return completedDomain;
  };
  return Entity;
})();