// top vmodels
_define([], function() {
	var vmodel = avalon.define("tool", function(vm) {
		vm.page = ""
		vm.log = []

		
		vm.clear = function() {
			document.getElementById("log").innerHTML = ""
		}
	})

	vmodel.$watch("page", function(page) {
		global.storage.set("page", page)
	})

})