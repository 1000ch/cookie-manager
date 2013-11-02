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

(function() {

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
      [].forEach.call(cookies, function(cookie) {
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
      var row;
      var rows = $container.find("li");
      for(var i = 0, len = rows.length;i < len;i++) {
        row = rows[i];
        if(row.getAttribute("data-domain").indexOf(word) === -1) {
          row.classList.add("hide");
        } else {
          row.classList.remove("hide");
        }
      }
    }, 1000));
  });

})();
