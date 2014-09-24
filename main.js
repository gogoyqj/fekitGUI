global.$ = $
global.alert = alert
global.logger = logger = {
    log: function(text, className) {
        var className = className || "info",
            text = typeof text === "object" ? JSON.stringify(text) : text.toString()
        if (text != void 0 && text.match && text.match(/\[error\]/gi)) className = "error"
        var log = $("#log")
        if (!log[0]) return
        log.append("<p class=\"" + className + "\">" + text.replace(/\n/g, "<br>") + "</p>")
        log[0].scrollTop = log[0].scrollHeight
    },
    error: function(text) {
        this.log(text, "error")
    },
    success: function(msg) {
        this.log(msg, "success")
    }
}

function fileFilter(state, isProject) {
    if (isProject) {
        return false
    } else if (state.type === "folder") {
        return false
    }
    return true
}


var storage = require("storage").storage

    function objecter(key) {
        var key = key
        return {
            set: function(v) {
                storage.set(key, v)
            },
            getJSON: function() {
                return storage.getJSON(key)
            },
            get: function() {
                return storage.get(key)
            }
        }
    }

var events = require("events")
var abar = require("address_bar")
var folder_view = require("folder_view")
var fs = require("fs")
var shell = require("nw.gui").Shell
var jade = require("jade")
var util = require("util")
var spawn = require("child_process").spawn
var isWindows = process.platform === "win32" ? ".cmd" : ""
var installDir = process.cwd()
var targetDir = storage.get("path") || installDir
var allCommander = objecter("fekitCommands")
var allCommand = allCommander.getJSON()
var eventCenter = require("eventCenter").eventCenter
var cache = {
    canStartServer: {}
}

eventCenter.on("exit", function(data) {
    if (data.code === 0) {
        // install update dir
        if (data.cmd === "install") {
            eventCenter.emit("dir", data.cwd)
        } else if (data.cmd === "") {
            var arr = data._msg.split("\n"),
                cmds = [],
                version
                arr.forEach(function(ai, i) {
                    if (ai.match(/[a-z]+[^#]+#[\s\S]+/g)) {
                        var pos = ai.indexOf("#"),
                            c = ai.substring(0, pos).trim(),
                            des = ai.substring(pos + 1).trim()
                            cmds.push({
                                cmd: c.split(/[^a-z]+/)[0],
                                title: des,
                                text: c,
                            })
                    } else if (ai.match(/fekit [0-9]+\.[0-9]\.[0-9]+/gi)) {
                        version = ai.match(/[0-9]+\.[0-9]\.[0-9]+/gi)[0]
                    }
                })
                if (!allCommand || allCommand && allCommand.version != version) {
                    allCommander.set({
                        version: version,
                        commands: cmds
                    })
                    location.reload()
                }
            logger.success("[SUCCESS] fekit command list updated")
            return
        }
        logger.success(data.msg)
    }
})

function writeModel(k, v) {
    fekitModel[k] = v
}

function execCMD(cmd, args) {
    var callback = args.callback
    try {
        logger.log("[LOG] executing fekit " + cmd + "...")
        var cwd = args ? args.cwd : targetDir
        if (cmd === "server") cwd = cwd.substring(0, cwd.lastIndexOf("\\"))
        var run = spawn("fekit" + isWindows, [cmd], {
            cwd: cwd
        }),
            msg = []
            // kill不管用，不能杀掉fekit命令开启的进程

        function kill() {
            try {
                run.kill()
            } catch(e) {
                
            }
        }

        eventCenter.once("ctrl.c", kill)
        run.stderr.on("data", function(data) {
            eventCenter.removeListener("ctrl.c", kill)
            if (cmd === "") {
                return logger.error("[ERROR] 检查是否已安装fekit")
            }
            logger.error("[ERROR] " + data.toString())
        })
        run.stdout.on("data", function(data) {
            msg.push(data.toString())
            logger.log(data.toString())
        })
        run.on("close", function(code, signal) {
            var info = code ? "[ERROR] fekit " + cmd + " failed" : "[SUCCESS] fekit " + cmd + " success ^_^"
            if (cmd === "server") info = "[SUCCESS] server shut down"
            eventCenter.removeListener("ctrl.c", kill)
            eventCenter.emit("exit", {
                code: code,
                cmd: cmd,
                cwd: cwd,
                _msg: msg.join("\n"),
                msg: info
            })
            msg = []
            callback && callback(code)
        })
        if (cmd === "server") {
            fekitModel.$destroy.push(function() {
                kill()
            })
        }
    } catch (e) {
        logger.error("[ERROR] execute fekit " + cmd + " failed:" + e)
        callback && callback(255, e)
    }
}
// load all cmd
if (allCommand && allCommand.version) writeModel("commands", allCommand.commands)
execCMD("")

function backgroundInit() {
    var folder = new folder_view.Folder($("#files"))
    var addressbar = new abar.AddressBar($("#addressbar"))

    function explore(path) {
        var s = fs.statSync(path)
        if (s.isFile()) {
            return folder.emit("navigate", path, {
                name: path.substring(path.lastIndexOf("\\") + 1),
                path: path,
                type: "file"
            })
        }
        writeModel("page", "explore")
        addressbar.set(path)
        folder.open(path, fileFilter)
        storage.set("path", path)
    }

    // call fekit
    eventCenter.on("command.run", function(cmd, args) {
        cmd = cmd.trim()
        if (cmd == "config") {
            var p = $("#files .config").data("path")
            args.callback && args.callback()
            return folder.emit("navigate", p, {
                name: "fekit.config",
                path: p,
            })
        }
        execCMD(cmd, args)
    })

    eventCenter.on("config.save", function(path, content, callback, exitAfterSave) {
        if (exitAfterSave != "exit") {
            fs.writeFileSync(path, content)
            logger.success("[SUCCESS] 保存成功")
        }
        if (exitAfterSave) {
            explore(path.substring(0, path.lastIndexOf("\\")))
        }
        callback && callback()
    })

    eventCenter.on("dir", explore)

    addressbar.on("paths", function(mine) {
        writeModel("paths", mine.paths)
    })

    addressbar.on("navigate", function(dir) {
        explore(dir)
    })

    folder.on("files", function(dir, data) {
        var newFiles = data.files
        newFiles = newFiles.sort(function(a, b) {
            if (a._type === "fekit") {
                cache["canStartServer"][dir] = true
                return 1
            }
        })
        writeModel("files", newFiles.reverse())
        var fkitcfg = dir + "\\" + "fekit.config"
        writeModel("isFekitModules", fs.existsSync(fkitcfg))

    })

    folder.on("navigate", function(dir, mime) {
        if (mime.type == "folder") {
            explore(mime.path)
            // 编辑fekit.config
        } else if (mime.name === "fekit.config") {
            writeModel("page", "edit")
            addressbar.set(mime.path)
            writeModel("configJSON", {
                name: mime.name,
                path: mime.path,
                content: fs.readFileSync(mime.path)
            })
        } else {
            shell.openItem(mime.path)
        }
    })


    explore(targetDir)
    $("#ct")[0].removeAttribute("ms-skip")
    eventCenter.on("ctrl.s", function() {
        if (fekitModel.page === "edit") fekitModel.save()
    })
    avalon.scan()
    logger.success("[SUCCESS] init finished")
}