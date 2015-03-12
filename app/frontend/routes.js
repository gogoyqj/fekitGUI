_define(["mmRouter/-mmState-new", 
	"vmodels/tool", 
	"vmodels/computer"], function() {
	function viewPath(name) {
		return "app/frontend/views/" + name
	}
	avalon.state("computer", {
		url: "/computer",
		controller: "computer",
		views: {
			"": {
				templateUrl: viewPath("computer.html")
			},
			"menu@": {
				templateUrl: viewPath("menu.html")
			},
			"url@computer": {
				templateUrl: viewPath("url.html")
			},
			"list@computer": {
				templateUrl: viewPath("disk.html")
			}
		},
		onChange: function() {
			// load diskes
		}
	})
	avalon.state("computer.path", {
		url: "/{path:.*}",
		controller: "computer",
		views: {
			"list@computer": {
				templateUrl: viewPath("file.html")
			}
		},
		onChange: function(arguments) {
			// load files
		}
	})
	avalon.state("home", {
		url: "/home",
		controller: "tool",
		views: {
			"menu@": {
				template: "shit"
			}
		}
	})
	avalon.state.config({
		onUnload: function() {
		},
		onLoad: function(fromState, toState) {
			// $eventManager.$fire("log", {
			// 	msg: toState.stateName + " ready"
			// })
		}
	})
	avalon.router.errorback = function() {
		avalon.router.redirect("/computer")
	}
	return {
		init: function() {
			avalon.history.start({
			    hashPrefix: "",
			    fireAnchor: false
			})
		}
	}
})