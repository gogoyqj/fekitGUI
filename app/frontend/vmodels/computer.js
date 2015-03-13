// _define([], function() {
// 	var vmodel = avalon.define("computer", function(vm) {

// 	})
// })
_define(["storage"], function() {
	var lastElement,
		vmodel = avalon.define("computer", function(vm) {
		vm.paths = []
		vm.diskes = []
		vm.files = []
		vm.basePath = [{name: "computer", path: ""}]
		vm.projects = []

		vm.navigate = function(event, path, reload, url) {
			event && event.preventDefault()
			var ele = avalon(this)
			if(ele.hasClass("focus") || url) {
				avalon.router.navigate('computer/'+ path, {reload: reload || false})
			} else {
				ele.addClass("focus")
				var canFocus = this.tagName == "A" ? this : this.getElementsByTagName("a")[0]
				canFocus && canFocus.focus()
				if(lastElement != ele) {
					lastElement && lastElement.removeClass("focus")
					lastElement = ele
				}
			}
			event && event.stopPropagation()
		}
		vm.set = function(name, value) {
			if(name == "paths") vm.paths = value ? vm.basePath.concat(value) : vm.basePath
		}
		vm.prev = function(event) {
			event && event.preventDefault()
		}
		vm.forKey = function(event) {
			console.log(event.keyCode)
		}
		vm.bookmark = function(event) {
			event && event.preventDefault()
			var len = vm.paths.length,
				path = vm.paths[len - 1]
			if(path) {
				// 防止重复
				for(var i = 0, len = vm.projects.length; i < len; i++) {
					if(vm.projects[i].path == path.path) return
				}
				var data = path.$model || avalon.mix({}, path) 
				vm.projects.push(data)
				vm.save()
			}
		}
		// 删除
		vm.remove = function(event, path) {
			event && event.preventDefault()
			for(var i = 0, len = vm.projects.length; i < len; i++) {
				if(path == vm.projects[i]) {
					vm.projects.splice(i, 1)
					return vm.save()
				}
			}
		}
		// 保存
		vm.save = function() {
			storage.set("projects", JSON.stringify(vm.projects.$model))
		}
	})
})