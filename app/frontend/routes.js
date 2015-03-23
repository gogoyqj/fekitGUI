_define(["mmRouter/-mmState-new", 
	"vmodels/tool", 
	"tree/avalon.tree.check",
	"tree/avalon.tree.async",
	"vmodels/computer", "storage"], function() {
	function viewPath(name) {
		return "app/frontend/views/" + name
	}
	var diskes,
		isWindows = function() {
			return !!global.isWindows
		},
		hasGlobal = function() {
			return typeof global != "undefined"
		},
		dataFilter = {
			getDiskes: function(msg) {
				if(isWindows()) return msg.match(/[A-Z][A-Za-z]*:[^\S]/g) || []
			},
			getFiles: function(result) {
				return result
			}
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
			if(diskes) return
			// load diskes
			$eventManager.$fire("cmd", {
				runner: "getDisk",
				callback: function(result) {
					if(!result.status) {
						avalon.vmodels.computer.diskes = diskes = dataFilter.getDiskes(result.msg.join(""))
					}
				}
			})
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
		onChange: function(path) {
			// load files
			var done = this.async()
			$eventManager.$fire("explore", {
				path: path,
				callback: function(result) {
					if(!result.status) {
						result = dataFilter.getFiles(result)
						avalon.vmodels.computer.files = result.files
					}
					done()
				}
			})
			var spliter = isWindows() ? "\\\\" : "/",
				paths = path.match(/[^:]+:|[\\\/]+[^\\\/]+/g),
				newPaths = []
			paths.forEach(function(p, index) {
				newPaths[index] = {
					name: p.replace(/[\\\/]+/g, ""),
					path: paths.slice(0, index + 1).join("")
				}
			})
			avalon.vmodels.computer.set("paths", newPaths)
		}
	})
	var projects
	avalon.state("home", {
		url: "/home",
		controller: "computer",
		views: {
			"menu@": {
				templateUrl: viewPath("menu.html")
			},
			"": {
				templateUrl: viewPath("home/profile.html")
			}
		},
		onChange: function() {
			if(projects) return
			var projects = storage.get("projects")
			projects = projects ? JSON.parse(projects) : []
			avalon.vmodels.computer.projects = projects
		}
	})
	var element
	$(document.body).on('click', function() {
		element && element.find('.focus').removeClass('focus')
	})
	avalon.state.config({
		onUnload: function() {
			if(avalon.vmodels.loading) avalon.vmodels.loading.toggle = true
		},
		onLoad: function(fromState, toState) {
			var name = toState.stateName
			avalon.vmodels.loading.toggle = false
			// 交互
			if(name.indexOf("computer") == 0) {
				if(name == "computer") avalon.vmodels.computer.set("paths")
				avalon.vmodels.tool.page = "computer"
				element = $("div.list")
			} else {
				avalon.vmodels.tool.page = name
				element = null
			}
		}
	})
	return {
		init: function() {
			// if(hasGlobal()) {
			// 	var path = storage.get("path"),
			// 		page = storage.get("page")
			// 	if(page == "computer" && path) avalon.router.redirect("/computer/" + path.replace(/\\/g, "\\"))
			// } else {
			// 	avalon.router.redirect("home")
			// }
			avalon.router.redirect("/home")
			avalon.history.start({
			    hashPrefix: "",
			    fireAnchor: false
			})
			avalon.router.errorback = function() {
				avalon.router.redirect("computer")
			}
			// load info
			var checklist = ["node"]
			function check() {
				var cmd = checklist.pop()
				if(!cmd) return
				$eventManager.$fire("cmd", {
					runner: cmd,
					cmd: ["-v"],
					callback: function(result) {
						if(!result.status) {
							var i = 0, msg = result.msg, len = msg.length
							for(; i < len; i++) {
								if(msg[i].match(/[0-9\.]+/g)) {
									avalon.vmodels.tool.infos.push(cmd + "版本：" + msg[i].trim())
									break
								}
							}
						}
						check()
					}
				})
			}
			check()
		}
	}
})