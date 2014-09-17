global.$ = $;
global.alert = alert;
global._log = function(a) {
  $("#log").append(a)
  $("#view").hide()
}
global.__msg = [];
global.__log = [];
var __console = console;
// override console
global.console = {
  info: function(info) {
    global.__msg.push(info)
  },
  log: function(info) {
    global.__log.push(info)
  }
}
global.__optimist = {
  argv: {
    $0: "node fekit",
    _: [],
  }
}
var fileFilter = function(state, isProject) {
  if (isProject) {
    return false
  } else if (state.type === "folder") {
    return false
  }
  return true
}

var abar = require('address_bar');
var folder_view = require('folder_view');
var path = require('path');
var fs = require('fs');
var shell = require('nw.gui').Shell;
var jade = require('jade');
var spawn = require('child_process').spawn;
var isWindows = process.platform === "win32" ? ".cmd" : "";
var cache = {
  canStartServer: {}
};

function getAllCMD() {
  var cmd = fekit.help;
  try{
    global.__msg = [];
    cmd();
    var info = global.__msg;
    global.__msg = [];
  }catch(e) {
    alert("error: " + e)
  }
}
// get all cmd
// getAllCMD();
// recover console
global.console = __console;

// call fekit
fekitModel.$cmd = function(cmd, args) {
  try{
    global.__optimist.argv._[0] = cmd;
    try{
      var run = spawn("fekit" + isWindows, [cmd.trim()], {
        cwd: args.cwd
      });
      run.stderr.on('data', function (data) {
        run.kill('SIGHUP');
        alert('出错了: ' + data);
      });
      run.stdout.on('data', function (data) {
      });
      run.on('close', function (code) {
        run.kill('SIGHUP');
        alert(code ? "" : "成功")
      });
    }catch(e) {
      alert(e)
    }
  }catch(e) {
    alert(e)
  }
}

fekitModel.$save = function(path, content) {
  fs.writeFileSync(path, content)
}

$(document).ready(function() {
  var folder = new folder_view.Folder($('#files'));
  var addressbar = new abar.AddressBar($('#addressbar'));

  function explore(path) {
    fekitModel.page = "explore";
    addressbar.set(path);
    folder.open(path, fileFilter);
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

  explore(process.cwd());

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
});