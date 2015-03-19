_define(["routes",
	"../background/app",
	"resizable/avalon.resizable"], function(routes, background) {
		// 数据交换中心
		window.ec = window.$eventManager,
			logger = {
				log: function(text, className) {
			        var className = className || "log",
			            text = typeof text === "object" ? JSON.stringify(text) : text.toString()
			            if (text != void 0 && text.match && text.match(/\[error\]/gi)) className = "error"
			        var log = $("#log")
			        if (!log[0]) return
			        text = text.replace(/\[(SUCCESS|ERROR|LOG)\][\s]?/g, "")
			        log.append("<p class=\"" + className + "\">["  + className.toUpperCase() + "] " + text.replace(/^(\n|\r\n)/g, "").replace(/\n/g, "<br>") + "</p>")
			        var p = $(".log-par")
			        p[0].scrollTop = p[0].scrollHeight
			    }
			}
		ec.$watch("log", function(data) {
			logger.log(data.msg, data.type)
		})
		// 读取到数据
		ec.$watch("data", function(data) {

		})
		background && background.init()
		routes.init()
})