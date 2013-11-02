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
    this.cookieCollection.each(function(cookieEntity) {
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