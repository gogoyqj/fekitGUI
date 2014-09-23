var editor = (function() {
  var json = {},
    _editor,
    editor = {
      init: function() {
        var container = document.getElementById('jsoneditor')
        var options = {
          mode: 'tree',
          modes: ['code', 'form', 'text', 'tree', 'view'], // allowed modes
          error: function(err) {
            alert(err.toString())
          }
        }

        _editor = new JSONEditor(container, options, json)
      },
      set: function(newJSON) {
        json = newJSON
        _editor && _editor.set(newJSON)
      },
      get: function() {
        var newJSON = JSON.stringify(_editor.get())
        try {
          newJSON = jsl.format.formatJson(newJSON)
        } catch (e) {
          return alert(e)
        }
        return newJSON
      }
    }
  return editor
})()
var fekitModel = avalon.define("fekit", function(vm) {
  vm.$destroy = []
  vm.files = []
  vm.paths = []
  vm.commands = []
  vm.configJSON = {}
  vm.page = "explore"
  vm.isFekitModules = false
  vm.saving = false

  vm.save = function(e, exit) {
    e && e.preventDefault()
    if (fekitModel.saving) return
    fekitModel.saving = true
    if (editor) {
      var newJSON = editor.get()
      eventCenter.emit("config.save", fekitModel.configJSON.path, newJSON, function() {
        fekitModel.saving = false
      }, exit)
    }
  }
  vm.cmd = function(e, cmd) {
    e.preventDefault()
    var paths = ""
    var me = avalon(this)
    if(me.hasClass("disabled")) return
    me.addClass("disabled")
    fekitModel.paths.forEach(function(item) {
      paths = item.path
    })
    eventCenter.emit("command.run", cmd, {
      cwd: paths,
      callback: function() {
        me.removeClass("disabled")
      }
    })
  }
  vm.$destroyFunc = function() {
    fekitModel.$destroy.forEach(function(func) {
      func && func()
    })
    location.reload()
  }
})

fekitModel.$watch("configJSON", function(v) {
  try {
    editor.set(JSON.parse(v.content))
  } catch (e) {
    alert("fekit.config格式错误!")
  }
})

avalon(document).bind("keydown", function(e) {
  var code = e.keyCode
  // logger.log(code)
  switch(code) {
    // ctrl + c
    case 67:eventCenter.emit("ctrl.c");break;
    // ctrl + s
    case 83:eventCenter.emit("ctrl.s");break;
    default:;
  }
})
