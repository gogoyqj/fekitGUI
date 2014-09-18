global.$ = $;
global.alert = alert;
global._log = function(a) {
  $("#log").append(a)
  $("#view").hide()
}

var fileFilter = function(state, isProject) {
  if (isProject) {
    return false
  } else if (state.type === "folder") {
    return false
  }
  return true
}
var events = require('events');
var abar = require('address_bar');
var folder_view = require('folder_view');
var path = require('path');
var fs = require('fs');
var shell = require('nw.gui').Shell;
var jade = require('jade');
var util = require('util');
var spawn = require('child_process').spawn;
var isWindows = process.platform === "win32" ? ".cmd" : "";
var cache = {
  canStartServer: {}
};

$(document).ready(function() {
  var folder = new folder_view.Folder($('#files'));
  var addressbar = new abar.AddressBar($('#addressbar'));
  var ec = (function() {
    function ec() {
      events.EventEmitter.call(this);
    }
    util.inherits(ec, events.EventEmitter);
    return new ec()
  })();

  ec.on("exit", function(data) {
    if(data.code === 0){
      // install update dir
      if(data.cmd === "install") {
        explore(data.cwd)
      } else if(data.cmd === "") {
        var arr= data.msg.split("\n"), cmds = [];
        arr.forEach(function(ai) {
          if(ai.match(/[a-z]+[^#]+#[\s\S]+/g)) {
            var pos = ai.indexOf("#"),
              c = ai.substring(0, pos).trim(),
              des = ai.substring(pos + 1).trim();
            cmds.push({
              cmd: c.split(/[^a-z]+/)[0],
              title: des,
              text: c,
            })
          }
        })
        fekitModel.commands = cmds;
        return
      }
      alert(data.msg)
    }
  });

  var hash = location.hash.replace(/^#/g, "").trim()
  if(!hash) hash = process.cwd()
  // call fekit
  fekitModel.$cmd = function(cmd, args) {
    cmd = cmd.trim()
    if(cmd == "config") {
      var p = $("#files .config").data("path");
      return folder.emit("navigate", p, {
        name: "fekit.config",
        path: p,
      })
    }
    try{
      var cwd = args ? args.cwd : hash,
        run = spawn("fekit" + isWindows, [cmd], {
        cwd: cwd
      }), msg = [];
      run.stderr.on('data', function (data) {
        run.kill('SIGHUP');
        alert('出错了: ' + data);
      });
      run.stdout.on('data', function (data) {
        msg.push(data)
      });
      run.on('close', function (code) {
        run.kill('SIGHUP');
        ec.emit("exit", {
          code: code,
          cmd: cmd,
          cwd: cwd,
          msg: msg.join("\n")
        });
        msg = [];
      });
    }catch(e) {
      alert(e)
    }
  }

  fekitModel.$save = function(path, content, exit) {
    fs.writeFileSync(path, content)
    if(exit) {
      fekitModel.page = "explore"
      fekitModel.paths.pop()
    }
  }

  function explore(path) {
    fekitModel.page = "explore";
    addressbar.set(path);
    folder.open(path, fileFilter);
    location.hash = "#" + path
  }

  folder.on("files", function(dir, data) {
    var newFiles = data.files;
    newFiles = newFiles.sort(function(a, b) {
      if(a._type === "fekit") {
        cache["canStartServer"][dir] = true;
        return 1;
      }
    });
    fekitModel.files = newFiles.reverse();
    var fkitcfg = dir + "\\" + "fekit.config";
    fekitModel.isFekitModules = fs.existsSync(fkitcfg);

  });
  addressbar.on("paths", function(mine) {
    fekitModel.paths.clear().push.apply(fekitModel.paths, mine.paths);
  });

  folder.on('navigate', function(dir, mime) {
    if (mime.type == 'folder') {
      explore(mime.path);
    // 编辑fekit.config
    } else if(mime.name === "fekit.config") {
      fekitModel.page = "edit";
      addressbar.set(mime.path);
      fekitModel.configJSON = {
        name: mime.name,
        path: mime.path,
        content: fs.readFileSync(mime.path)
      };
    } else {
      shell.openItem(mime.path);
    }
  });

  addressbar.on('navigate', function(dir) {
    explore(dir);
  });


  explore(hash);
  // load all cmd
  fekitModel.$cmd("");
  $("#ct")[0].removeAttribute("ms-skip")
  avalon.scan()
});