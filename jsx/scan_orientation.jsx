// === scan_orientation_strict.jsx ===
#target photoshop

var configPath = "D:/project/absentia8/temp_config.json";
var config = loadConfig(configPath);
if (!config || !config.folder) {
    alert("Не удалось загрузить конфиг или папка не указана");
    exit();
}

var sourceFolder = new Folder(config.folder);
if (!sourceFolder.exists) {
    alert("Папка изображений не существует");
    exit();
}

var imageFiles = sourceFolder.getFiles(/\.(jpg|jpeg|png)$/i);
var orientationMap = {};

for (var i = 0; i < imageFiles.length; i++) {
    var file = imageFiles[i];
    var doc = app.open(file);

    var w = doc.width.value;
    var h = doc.height.value;

    var orientation = (w > h) ? "horizontal" : (h > w) ? "vertical" : "square";
    orientationMap[file.name] = orientation;
    $.writeln("→ " + file.name + " = " + orientation + " [" + w + "x" + h + "]");

    doc.close(SaveOptions.DONOTSAVECHANGES);
}

// Сохраняем JSON вручную
var savePath = new File("D:/project/absentia8/orientation_map.json");
savePath.encoding = "UTF-8";
savePath.open("w");

var output = "{\n";
for (var key in orientationMap) {
    output += '  "' + key + '": "' + orientationMap[key] + '",\n';
}
output = output.replace(/,\n$/, "\n") + "}\n";
savePath.write(output);
savePath.close();
alert("orientation_map.json сохранён.");

function loadConfig(path) {
    var file = new File(path);
    if (!file.exists) return null;
    file.open("r");
    var str = file.read();
    file.close();
    var obj = {};
    str.replace(/"([^\"]+)":\s*"([^\"]*)"/g, function (_, key, value) {
        obj[key] = value;
    });
    return obj;
}
