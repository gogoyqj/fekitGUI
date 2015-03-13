_define([], function () {
	window.storage = {
		get: function(name) {
			return localStorage.getItem(name)
		},
		getJSON: function(name) {
			return JSON.parse(this.get(name))
		},
		set: function(name, v) {
			if(typeof v === "object") var v = JSON.stringify(v)
			localStorage.setItem(name, v)
		}
	}
})