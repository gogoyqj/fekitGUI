_define(["routes",
	"../background/app",
	"resizable/avalon.resizable"], function(routes, background) {
		// 数据交换中心
		var ec = window.$eventManager
		ec.$watch("log", function(data) {
			console.log(data)
		})
		// 读取到数据
		ec.$watch("data", function(data) {

		})
		routes.init()
		background && background.init()
})