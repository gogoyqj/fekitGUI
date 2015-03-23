// top vmodels
_define([], function() {
	var cache = {},
		vmodel = avalon.define("tool", function(vm) {
		vm.page = ""
		vm.log = []
		vm.infos = []
		vm.projecttypes = [{name: "oniui", title: "oniui"}, {name: "fekit", title: "fekit modules"}]
		vm.projecttype = ""
		vm.$tree = {
			children: [
				{
					name: "tree",
					children: [{
						name: "0.0.1"
					},{
						name: "0.0.2"
					}]
				},
				{
					name: "tooltip",
					children: [{
						name: "0.0.1"
					},{
						name: "0.0.2"
					}]
				}
			],
			view: {
				showIcon: false
			},
			check: {
    			enable: true,
    			chkboxType: {
    				N: "s",
    				Y: "p"
    			}
    		}
		}

		
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
	// render module tree
	function callback(data, projecttype) {
		if(projecttype) {
			cache[projecttype] = data
		}
	}
	vmodel.$watch("projecttype", function(projecttype) {
		if(projecttype) {
			var cacheData = cache[projecttype]
			if(cacheData) return callback(cacheData)
			ec.$fire("loadData", {
				name: projecttype,
				type: "module",
				callback: function(data) {
					callback(data, projecttype)
				}
			})
		}
	})

})