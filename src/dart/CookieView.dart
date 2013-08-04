class CookieView implements ICookieView {
	List<CookieEntity> cookieEntityList;
	CookieView(List<CookieEntity> cookieEntityList) {
		this.cookieEntityList = cookieEntityList;
	}

	String getHTML() {
		String html = "";
		String domain = "";
		List<String> shownDomain = new List<String>();
		void callback(CookieEntity cookieEntity) {
			domain = cookieEntity.domain;
			if(!shownDomain.contains(domain)) {
				shownDomain.add(domain);
				html +=
					"<li data-domain='" + domain +  "'>" +
						"<a href='" + cookieEntity.url() + "' target='_blank'>" +
							cookieEntity.completedDomain() +
						"</a>" +
						"<button class='btn js-delete' data-domain='" + domain + "'>" +
							"<i class='icon-remove'></i> DELETE" +
						"</button>" +
					"</li>";
			}
		}
		this.cookieEntityList.forEach(callback);
		return html;
	}
}

interface ICookieView {
	String getHTML();
}