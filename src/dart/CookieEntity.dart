class CookieEntity implements ICookieEntity {
	int cookieId;
	String name;
	String value;
	String domain;
	bool hostOnly;
	String path;
	bool secure;
	bool httpOnly;
	bool session;
	DateTime expirationDate;
	String storeId;

	/**
	 * Constructor
	 * @param Object
	 */
	CookieEntity(Object cookie) {
		this.cookieId = generateUniqueId();
		this.name = cookie.name as String;
		this.value = cookie.value as String;
		this.domain = cookie.domain as String;
		this.hostOnly = cookie.hostOnly;
		this.path = cookie.path as String;
		this.secure = cookie.secure;
		this.httpOnly = cookie.httpOnly;
		this.session = cookie.session;
		this.expirationDate = new DateTime.fromMillisecondsSinceEpoch(cookie.expirationDate, isUtc: true);
		this.storeId = cookie.storeId;
	}

	/**
	 * get url
	 */
	String url() {
		if(this.secure) {
			return "https://" + this.domain + this.path;
		} else {
			return "http://" + this.domain + this.path;
		}
	}

	/**
	 * get completed domain
	 */
	String completedDomain() {
		String completedDomain = this.domain;
		if(completedDomain.startsWith(".")) {
			completedDomain = "*" + completedDomain;
		}
		return completedDomain;
	}
}

interface ICookieEntity {
	String url();
	String completedDomain();
}