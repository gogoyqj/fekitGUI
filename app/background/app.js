_define(["mmRouter/-mmState-new"], function() {
	// do load
	if(typeof global != "undefined") {
		var fs = require("fs")
		// xhp补丁
		function xhp() {
			this.readyState = 0
			this.status = 0
			this.responseText = ""
			this.async = true
		}
		xhp.prototype = {
			open: function(method, url, async) {
				this.async = true
				this.url = url
			},
			setRequestHeader: function() {},
			onreadystatechange: function() {},
			send: function() {
				var me = this
				if(this.async) {
					try {
						fs.readFile(this.url, "utf-8", function(err, data) {
							me.readyState = 4
							if(err) {
								me.status = 700
							} else {
								me.responseText = data
							}
							me.onreadystatechange && me.onreadystatechange()
						})
					} catch(e) {
						logger.log(arguments)
					}
				} else {
					try {
						this.responseText = fs.readFileSync(this.url, "utf-8")
					} catch(e) {
						this.status = 700
					} finally {
						this.readyState = 4
						this.onreadystatechange && this.onreadystatechange()
					}
				}			
			}
		}
		window._XMLHttpRequest = xhp
		global.$ = $
		global.alert = alert
		global.noop = function() {}
		global.console = console
		global.localStorage = localStorage
		global.$eventManager = $eventManager
		var isWindows = global.isWindows = process.platform === "win32" ? ".cmd" : "",
			installDir = global.installDir = process.cwd(),
			storage = global.storage = require("storage").storage,
			targetDir = global.targetDir = storage.get("path") || installDir,
			shell = global.shell = require("nw.gui").Shell,
			logger = global.logger = {
			    log: function(msg, className) {
			        $eventManager.$fire("log", {
			        	type: className || "log",
			        	msg: msg
			        })
			    },
			    error: function(msg) {
			        this.log(msg, "error")
			    },
			    success: function(msg) {
			        this.log(msg, "success")
			    }
			}
		// load main
		require("backgroundMain.js")
	}
})