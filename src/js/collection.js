var CookieCollection = (function() {
  /**
   * CookieCollection
   * @param {Array<CookieEntity>} collection
   */
  function Collection(collection) {
    this.length = collection.length;
    for(var i = 0, len = collection.length;i < len;i++) {
      this[i] = collection[i];
    }
  }
  /**
   * Get entity which matches given domain.
   * @param {String} domain
   * @returns {Array}
   */
  Collection.prototype.get = function(domain) {
    var cookieEntities = [];
    for(var i = 0, len = this.length;i < len;i++) {
      cookieEntity = this[i];
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
  Collection.prototype.remove = function(cookieId) {
    var removeIndex = -1;
    var cookieEntity = null;
    for(var i = 0, len = this.length;i < len;i++) {
      cookieEntity = this[i];
      if(cookieEntity.cookieId == cookieId) {
        removeIndex = i;
        break;
      }
    }
    if(removeIndex != -1) {
      [].splice.call(this, removeIndex, 1);
    }
  };
  Collection.prototype.each = function(callback) {
    for(var i = 0, len = this.length;i < len;i++) {
      callback(this[i], i, this);
    }
  };
  return Collection;
})();