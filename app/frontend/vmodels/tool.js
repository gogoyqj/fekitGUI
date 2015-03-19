// top vmodels
_define([], function() {
	var vmodel = avalon.define("tool", function(vm) {
		vm.page = ""
		vm.log = []
		vm.infos = []

		
		vm.clear = function() {
			$("#log p").remove()
		}

		vm.excute = function() {
			var code = $("#command").val()
			$eventManager.$fire("log", {
				msg: "excute " + code + " from command line"
			})
			try {
				eval(code)
			} catch(e) {
				alert(e)
			}
		}
	})

	vmodel.$watch("page", function(page) {
		global.storage.set("page", page)
	})

})