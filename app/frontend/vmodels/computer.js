// _define([], function() {
// 	var vmodel = avalon.define("computer", function(vm) {

// 	})
// })
_define([], function() {
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
		}
	})
})