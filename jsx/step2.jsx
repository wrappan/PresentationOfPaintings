#target photoshop

// Загрузка временной конфигурации
var tempConfigPath = "D:/project/absentia8/temp_config.json";
var config = loadConfig(tempConfigPath);
if (!config) {
    alert("Ошибка: Не удалось загрузить параметры!");
    exit();
}

var imageFolder = config.folder;
var maxSize = parseFloat(config.maxSize);
var randomOffset = parseFloat(config.randomOffset);
var units = config.units; // "in" или "sm"
var opacity = parseInt(config.opacity);

// Функция загрузки конфигурации
function loadConfig(configPath) {
    var configFile = new File(configPath);
    if (!configFile.exists) return null;

    configFile.open("r");
    var content = configFile.read();
    configFile.close();

    var config = {};
    content.replace(/"([^"]+)":\s*"([^"]*)"/g, function (m, key, value) {
        config[key] = value;
    });
    return config;
}

// Получение текстур
var textureFolder = "D:/project/absentia8/Исходные файлы/Текстуры холста";
var textureFiles = new Folder(textureFolder).getFiles(/\.(jpg|jpeg|png)$/i);
if (!textureFiles.length) {
    alert("Нет доступных текстур!");
    exit();
}

function getRandomTexture() {
    return textureFiles[Math.floor(Math.random() * textureFiles.length)];
}

// Округление до одного знака после запятой, с отбросом .0
function roundDisplay(val) {
    val = Math.round(val * 10) / 10;
    return (val % 1 === 0) ? val.toFixed(0) : val.toFixed(1);
}

// Обработка всех изображений
var imageFiles = new Folder(imageFolder).getFiles(/\.(jpg|jpeg|png)$/i);
var resultFolder = "D:/project/absentia8/Result";

for (var i = 0; i < imageFiles.length; i++) {
    var file = new File(imageFiles[i]);
    if (!file.exists) continue;

    var doc = app.open(file);
    var fileName = doc.name.replace(/\.[^\.]+$/, "");
    var savePath = new Folder(resultFolder + "/" + fileName);
    if (!savePath.exists) savePath.create();

    // Определение сторон
    var w = doc.width.as("px");
    var h = doc.height.as("px");
    var isPortrait = h > w;
    var minSide = Math.min(w, h);
    var ratio = w / h;

    // Генерация случайного значения наименьшей стороны
    var minSize = maxSize - Math.random() * randomOffset;
    minSize = Math.round(minSize * 10) / 10;
    var otherSize = minSize * (isPortrait ? ratio : 1 / ratio);
    var widthOut = isPortrait ? otherSize : minSize;
    var heightOut = isPortrait ? minSize : otherSize;

    // Округления
    widthOut = roundDisplay(widthOut);
    heightOut = roundDisplay(heightOut);

    // Имя файла
    var finalName = fileName + "_" + widthOut + "_x_" + heightOut + "_" + units + ".png";

    // Наложение текстуры
    var texturePath = getRandomTexture();
    var textureFile = new File(texturePath);
    if (!textureFile.exists) continue;

    var textureDoc = app.open(textureFile);
    textureDoc.resizeImage(doc.width, doc.height);
    textureDoc.selection.selectAll();
    textureDoc.selection.copy();
    textureDoc.close(SaveOptions.DONOTSAVECHANGES);

    var textureLayer = doc.artLayers.add();
    doc.paste();
    textureLayer.opacity = opacity;
    textureLayer.blendMode = BlendMode.OVERLAY;

    // Сохранение
    var saveFile = new File(savePath + "/" + finalName);
    doc.saveAs(saveFile, new PNGSaveOptions(), true);
    doc.close(SaveOptions.DONOTSAVECHANGES);
}
