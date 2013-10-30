/**
 * CookieManager
 * An easy way to manage your browser cookies.
 * Copyright 1000ch<http://1000ch.net/>
 */
(function() {

  //cache
  var nativeForEach = [].forEach;
  var nativeSlice = [].slice;
  var nativeSplice = [].splice;

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

  /**
   * Throttle
   * @param {Function} func
   * @param {Number} delay
   * @returns {Function}
   */
  function throttle(fn, delay) {
    var timer = null;
    return function() {
      var context = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  }

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
        nativeSplice.call(this, removeIndex, 1);
      }
    };
    Collection.prototype.each = function(callback) {
      for(var i = 0, len = this.length;i < len;i++) {
        callback(this[i], i, this);
      }
    };
    return Collection;
  })();

  var CookieView = (function() {
    /**
     * CookieView
     * @{CookieCollection} cookieCollection
     */
    function View(cookieCollection) {
      this.cookieCollection = cookieCollection;
    }
    /**
     * Generate html string.
     * @returns {String}
     */
    View.prototype.get = function() {
      var shownDomain = [];
      var html = "";
      var domain = "";
      nativeForEach.call(this.cookieCollection, function(cookieEntity) {
        domain = cookieEntity.domain;
        if(shownDomain.indexOf(domain) == -1) {
          shownDomain.push(domain);
          html +=
            "<li data-domain='" + domain +  "'>" +
              "<a href='" + cookieEntity.url() + "' target='_blank'>" +
                cookieEntity.completedDomain() +
                "<button class='btn btn-info pull-right js-delete' data-domain='" + domain + "'>" +
                  "<i class='glyphicon glyphicon-remove'></i> DELETE" +
                "</button>" + 
              "</a>" +
            "</li>";
        }

      });
      return html;
    };
    return View;
  })();

  /**
   * CookieAccess
   */
  var CookieAccess = {
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

  var $container = null;
  var $search = null;

  var cookieView = null;
  var cookieCollection = null;

  /**
   * delegate button hover event
   */
  function bindEventHandler() {
    $container.addClass("has-hover");
  }

  /**
   * undelegate button hover event
   */
  function unbindEventHandler() {
    $container.removeClass("has-hover");
  }

  var scrollTimerId = null;
  window.addEventListener("scroll", function() {
    if(!scrollTimerId) {
      unbindEventHandler();
    } else {
      window.clearTimeout(scrollTimerId);
    }
    scrollTimerId = window.setTimeout(function() {
      scrollTimerId = null;
      bindEventHandler();
    }, 300);
  });

  //when document is ready, call init
  $(document).ready(function() {
    //cache elements
    $container = $("#js-cookies");
    $search = $("#js-search");

    //get all cookies
    CookieAccess.getAll({}, function(cookies) {
      var cookieArray = [];
      nativeForEach.call(cookies, function(cookie) {
        cookieArray.push(new CookieEntity(cookie));
      });
      cookieCollection = new CookieCollection(cookieArray);
      cookieView = new CookieView(cookieCollection);
      $container.append(cookieView.get());
    });

    $container.on("click", "a", function(e) {
      e.preventDefault();
    });

    //bind event to $container
    $container.on("click", ".js-delete", function(e) {
      var clickedDomain = this.getAttribute("data-domain");
      var relatedCookies = cookieCollection.get(clickedDomain);

      //remove row
      var $li = $(this).closest("li");
      $li.fadeOut("fast", function() {
        $li.remove();
      });

      //remove cookies related with domain
      relatedCookies.forEach(function(relatedCookie) {
        CookieAccess.remove(relatedCookie, function(details) {
          console.log(details);
        });
      });
    });

    bindEventHandler();

    $search.on("keyup", throttle(function() {
      var word = $(this).val();
      var row, domain;
      var rows = $container.find("li");
      for(var i = 0, len = rows.length;i < len;i++) {
        row = rows[i];
        domain = row.getAttribute("data-domain");
        if(domain.indexOf(word) === -1) {
          row.classList.add("none");
        } else {
          row.classList.remove("none");
        }
      }
    }, 1000));
  });

})();
