#target photoshop

// Чтение параметров из временного файла
var tempConfigPath = "D:/project/absentia8/temp_config.json";
var config = loadConfig(tempConfigPath);
if (!config) {
    alert("Ошибка: Не удалось загрузить параметры!");
    exit();
}

var imageFolder = config.folder;
var partsWidth = parseInt(config.columnsWidth);
var partsHeight = parseInt(config.columnsHeight);
var opacity = parseInt(config.opacity);
var fileFormat = config.format;

// Проверка данных
if (!new Folder(imageFolder).exists || isNaN(partsWidth) || isNaN(partsHeight) || isNaN(opacity)) {
    alert("Ошибка: Неверные параметры!");
    exit();
}

// Путь к текстурам
var textureFolder = "D:/project/absentia8/Исходные файлы/Текстуры холста";
var textureFiles = new Folder(textureFolder).getFiles(/\.(jpg|jpeg|png)$/i);
if (!textureFiles.length) {
    alert("Текстуры не найдены!");
    exit();
}

// Функция для выбора случайной текстуры
function getRandomTexture() {
    return textureFiles[Math.floor(Math.random() * textureFiles.length)];
}

// Функция для загрузки конфига
function loadConfig(configPath) {
    var configFile = new File(configPath);
    if (!configFile.exists) return null;

    configFile.encoding = "UTF-8"; // Указываем кодировку
    configFile.open("r");
    var content = configFile.read();
    configFile.close();

    // Удаляем BOM-маркер, если он есть
    if (content.charCodeAt(0) === 0xFEFF) {
        content = content.substring(1);
    }

    // Ручной парсинг JSON (ExtendScript не поддерживает JSON.parse)
    var config = {};
    content.replace(/"([^"]+)":\s*"([^"]*)"/g, function (m, key, value) {
        config[key] = value;
    });
    return config;
}

// Основная функция обработки
function processImage(imagePath, saveFolder, fileFormat) {
    var file = new File(imagePath);
    if (!file.exists) return;

    var doc = app.open(file);
    var fileName = doc.name.replace(/\.[^\.]+$/, "");
    var savePath = new Folder(saveFolder + "/" + fileName);
    if (!savePath.exists) savePath.create();

    var partWidth = doc.width / partsWidth;
    var partHeight = doc.height / partsHeight;

    for (var i = 0; i < partsWidth; i++) {
        for (var j = 0; j < partsHeight; j++) {
            var bounds = [i * partWidth, j * partHeight, (i + 1) * partWidth, (j + 1) * partHeight];
            doc.crop(bounds);

            // Наложение текстуры
            var texturePath = getRandomTexture();
            var textureFile = new File(texturePath);
            if (!textureFile.exists) continue;

            var textureLayer = doc.artLayers.add();
            textureLayer.name = "Texture";

            // Открываем текстуру как отдельный документ
            var textureDoc = app.open(textureFile);
            textureDoc.resizeImage(doc.width, doc.height); // Масштабируем текстуру
            textureDoc.selection.selectAll();
            textureDoc.selection.copy();
            textureDoc.close(SaveOptions.DONOTSAVECHANGES);

            // Вставляем текстуру в основной документ
            doc.paste();
            textureLayer.opacity = opacity;
            textureLayer.blendMode = BlendMode.OVERLAY;

            // Сохранение части
            var partName = fileName + "_" + ("0" + ((i * partsHeight) + j + 1)).slice(-2) + "." + fileFormat;
            var saveFile = new File(savePath + "/" + partName);

            if (fileFormat === "jpg") {
                doc.saveAs(saveFile, new JPEGSaveOptions(), true);
            } else if (fileFormat === "png") {
                doc.saveAs(saveFile, new PNGSaveOptions(), true);
            }

            // Возвращение к исходному состоянию
            doc.close(SaveOptions.DONOTSAVECHANGES);
            doc = app.open(file);
        }
    }

    doc.close(SaveOptions.DONOTSAVECHANGES);
}

// Обработка всех изображений в папке
var imageFiles = new Folder(imageFolder).getFiles(/\.(jpg|jpeg|png)$/i);
var saveFolder = "D:/project/absentia8/Result";
if (!new Folder(saveFolder).exists) new Folder(saveFolder).create();

for (var i = 0; i < imageFiles.length; i++) {
    processImage(imageFiles[i].fsName, saveFolder, fileFormat);
}