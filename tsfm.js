var ui = new UITable()
ui.showSeparators = 0
var fm = FileManager.local()
var dd = fm.documentsDirectory().split("/").slice(0, -1).join("/")+"/"
console.log(dd)
var cd = fm.documentsDirectory()
var lastCommand = ''
var inputField

// initialize the prompt
function createPrompt() {
    var row = new UITableRow()
    row.height = 25
    var cell = UITableCell.text(`[${Device.model()}@${Device.systemName()}  LOCAL/${cd.split(dd)[1]} ] $`)
    cell.titleColor = new Color('#12abef')
    row.addCell(cell)
    row.dismissOnSelect = 0
    row.onSelect = async () => {
        await terminal()
    }
    inputField = row
    ui.addRow(row)
}

createPrompt()
ui.present(1)

// main function
async function terminal() {
    var enteredCommand = await enter()
    if (enteredCommand != -1) {
        // when not canceled
        var result = await command(analyze(enteredCommand))
        await draw(ui, result)
    }
}

// draw table
async function draw(table, contents) {
    table.removeRow(inputField)
    var row = new UITableRow()
    row.height = 25
    var cell = UITableCell.text(`[${Device.model()}@${Device.systemName()}  ${cd} $ ${lastCommand}`)
    cell.titleColor = new Color('#12abef')
    row.addCell(cell)
    table.addRow(row)

    for (var content of contents) {
        row = new UITableRow()
        row.height = 25
        if (content.slice(0, 3) == "_D_") {
            content = content.slice(3)
            cell = UITableCell.text(content)
            cell.titleColor = new Color('90ef90')
        } else if (content.slice(0, 3) == "_E_") {
            content = "Error : "+content.slice(3)
            cell = UITableCell.text(content)
            cell.titleColor = new Color('ff3333')
        } else if (content.slice(0, 3) == "_P_") {
            row.height = 500
            content = content.slice(3)
            cell = await UITableCell.image(Image.fromFile(content))
        } else {
            cell = UITableCell.text(content)
        }
        row.addCell(cell)
        table.addRow(row)
    }
    createPrompt()
    ui.reload()
}

// execute commands
async function command(cmd) {
    parameter = cmd[1]
    var result = []
    switch (cmd[0]) {
        case "ls":
            try {
                var files = await fm.listContents(cd)
            } catch (e) {
                result = ['_E_'+e.message]
                break
            }
            for (var file of files) {
                if (fm.isDirectory(cd+'/'+file)) {
                    file = `_D_${file}`
                }
                result.push(file)
            }
            break
        case "cd":
            var tmp = cd
            if (parameter[0]) {
                cd += "/" + parameter[0]
            } else {
                cd = cd.split("/").slice(0, -1).join("/")
            }
            if (!fm.fileExists(cd)) {
                cd = tmp
                result = ["_E_No such file or directory"]
            } else if (!fm.isDirectory(cd)) {
                result = [`_E_${cd} is not a directory`]
            } else {
                result = []
            }
            break
        case "pwd":
            result = [cd]
            break
        case "cat":
            if (!fm.fileExists(cd+"/"+parameter[0])) {
                result = ["_E_No such file or directory"]
            } else {
                QuickLook.present(cd+"/"+parameter[0], false)
                if (['png', 'jpg', 'jpeg'].includes(fm.fileExtension(cd+"/"+parameter[0]))) {
                    result = [`_P_${cd+"/"+parameter[0]}`]
                } else {
                    result = [fm.fileExtension(cd+"/"+parameter[0])]
                }
            }
            break
        case "rm":
            try {
                fm.remove(cd+"/"+parameter[0])
            } catch (e) {
                result = ["_E_"+e.message]
            }
            break
        case "script":
            var availables = {
                "tsfm": "https://raw.githubusercontent.com/a-ori-a/Widgets/master/tsfm.js",
                "calendar": "https://raw.githubusercontent.com/cy-1818/Scriptable_Scripts/main/Calendar/calendar.js",
                "randomQuotes": "https://raw.githubusercontent.com/a-ori-a/Widgets/master/randomQuotes.js",
                "dayCounter": "https://raw.githubusercontent.com/a-ori-a/Widgets/master/dayCounter.js",
                "tsfm-ex": "https://raw.githubusercontent.com/cy-1818/Scriptable_Scripts/main/tsfm-ex/tsfm-ex.js"
            }
            var icld = FileManager.iCloud()
            var rq = new Request(availables[parameter[0]])
            try {
                var script = await rq.loadString()
            } catch (e) {
                result = ["_E_"+e.message]
                break
            }
            result = []
            icld.writeString(icld.documentsDirectory()+"/"+parameter[0]+".js", script)
            if (icld.fileExists(icld.documentsDirectory()+"/"+parameter[0]+".js")) {
                result.push(`File ${parameter[0]} exists, updating`)
            } else {
                result.push("Downloading script")
            }
            result.push("install complete")
            break
        default:
            result.push(`_E_Command "${cmd[0]}" not found`)
    }
    return result
}

// show input alert
async function enter() {
    input = new Alert()
    input.title = `[${cd.split(dd)[1]}] $`
    input.addTextField("command")
    input.addAction("OK")
    input.addCancelAction("Cancel")
    res = await input.present(input)
    if (res == "-1") {
        return -1
    } else {
        lastCommand = input.textFieldValue(0)
        return input.textFieldValue(0)
    }
}

// analyze commands (get parameter)
function analyze(cmd) {
    cmd = cmd.split(" ")
    if (cmd.length == 1) {
        return [cmd[0],
            []]
    } else {
        return [cmd[0],
            [cmd.slice(1).join(" ")]]
    }
}
