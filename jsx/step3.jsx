#target photoshop

// ==== Загрузка конфигурации и ориентаций ====
var configPath = "D:/project/absentia8/temp_config.json";
var orientationPath = "D:/project/absentia8/orientations.json";

var config = loadConfig(configPath);
if (!config) {
    alert("Ошибка: не удалось загрузить конфигурацию.");
    exit();
}

var orientationMap = loadOrientationList(orientationPath);
if (!orientationMap) {
    alert("Ошибка: не удалось загрузить orientations.json. Сначала запустите orientation.jsx");
    exit();
}

var sourceFolder = Folder(config.folder.replace(/\//g, '\\'));
var targetFolder = Folder((config.targetFolder || "D:/project/absentia8/Result").replace(/\//g, '\\'));
var mockupCount = parseInt(config.mockupCount || "0");
var mockupFormat = (config.mockupFormat || "png").toLowerCase();
var mockupResolution = config.mockupResolution || "original";

// ИСПРАВЛЕНИЕ: Добавляем проверку на пустые строки и валидацию папок
var horizontalMockups = null;
var verticalMockups = null;
var squareMockups = null;

if (config.horizontalMockups && config.horizontalMockups.length > 0) {
    // Преобразуем пути к Windows-формату, если нужно
    var hPath = config.horizontalMockups.replace(/\//g, '\\');
    horizontalMockups = Folder(hPath);
    $.writeln("🧪 Создан horizontalMockups: " + hPath);
} else {
    $.writeln("⚠️ ПРЕДУПРЕЖДЕНИЕ: horizontalMockups не задан в конфиге!");
}

if (config.verticalMockups && config.verticalMockups.length > 0) {
    var vPath = config.verticalMockups.replace(/\//g, '\\');
    verticalMockups = Folder(vPath);
    $.writeln("🧪 Создан verticalMockups: " + vPath);
} else {
    $.writeln("⚠️ ПРЕДУПРЕЖДЕНИЕ: verticalMockups не задан в конфиге!");
}

if (config.squareMockups && config.squareMockups.length > 0) {
    var sPath = config.squareMockups.replace(/\//g, '\\');
    squareMockups = Folder(sPath);
    $.writeln("🧪 Создан squareMockups: " + sPath);
} else {
    $.writeln("⚠️ ПРЕДУПРЕЖДЕНИЕ: squareMockups не задан в конфиге!");
}

// Детальная отладка загруженных путей
$.writeln("🧪 === ОТЛАДКА КОНФИГУРАЦИИ ===");
$.writeln("🧪 config.horizontalMockups = '" + (config.horizontalMockups || "ПУСТО") + "'");
$.writeln("🧪 config.verticalMockups = '" + (config.verticalMockups || "ПУСТО") + "'");
$.writeln("🧪 config.squareMockups = '" + (config.squareMockups || "ПУСТО") + "'");

$.writeln("🧪 horizontalMockups object = " + horizontalMockups);
$.writeln("🧪 horizontalMockups exists = " + (horizontalMockups ? horizontalMockups.exists : "NULL"));
$.writeln("🧪 horizontalMockups fsName = " + (horizontalMockups ? horizontalMockups.fsName : "NULL"));

$.writeln("🧪 verticalMockups object = " + verticalMockups);
$.writeln("🧪 verticalMockups exists = " + (verticalMockups ? verticalMockups.exists : "NULL"));
$.writeln("🧪 verticalMockups fsName = " + (verticalMockups ? verticalMockups.fsName : "NULL"));

function loadConfig(path) {
    var file = new File(path);
    if (!file.exists) return null;
    file.open("r");
    var str = file.read();
    file.close();
    
    // ИСПРАВЛЕНИЕ: Более надежный парсинг JSON
    var obj = {};
    try {
        // Удаляем возможные BOM и лишние пробелы
        str = str.replace(/^\uFEFF/, '').replace(/^\s+|\s+$/g, '');
        
        // Исправляем экранированные слеши для Windows путей
        str = str.replace(/\\\\/g, '/').replace(/\\/g, '/');
        
        // Попробуем eval (осторожно!)
        obj = eval('(' + str + ')');
        $.writeln("🧪 Конфиг загружен через eval()");
        
        // Выводим загруженные пути для отладки
        $.writeln("🧪 Загружены пути:");
        for (var key in obj) {
            $.writeln("🧪   " + key + ": '" + obj[key] + "'");
        }
        
    } catch (e) {
        $.writeln("🧪 Ошибка eval(), переходим на regex парсинг: " + e);
        // Fallback на простой regex парсинг
        str.replace(/"([^\"]+)":\s*"([^\"]*)"/g, function (_, key, value) {
            // Исправляем пути и здесь тоже
            value = value.replace(/\\\\/g, '/').replace(/\\/g, '/');
            obj[key] = value;
        });
    }
    
    return obj;
}

function loadOrientationList(path) {
    var file = new File(path);
    if (!file.exists) return null;
    file.open("r");
    var content = file.read();
    file.close();
    
    // ИСПРАВЛЕНИЕ: Очищаем от BOM и лишних символов
    content = content.replace(/^\uFEFF/, '').replace(/^\s+|\s+$/g, '');
    
    var list = eval('(' + content + ')');
    var map = {};
    for (var i = 0; i < list.length; i++) {
        // ИСПРАВЛЕНИЕ: Очищаем filename от возможных лишних символов
        var cleanFilename = list[i].filename.replace(/^\s+|\s+$/g, '');
        map[cleanFilename] = list[i].orientation;
        $.writeln("🧪 Добавлен в orientationMap: '" + cleanFilename + "' -> '" + list[i].orientation + "'");
    }
    return map;
}

function getMockupList(folder) {
    if (!folder || !folder.exists) return [];
    return folder.getFiles("*.psd");
}

function replaceSmartObjectContents(imagePath) {
    var internalDoc = app.activeDocument;
    var targetW = internalDoc.width.value;
    var targetH = internalDoc.height.value;

    var imageDoc = app.open(new File(imagePath));
    var imgW = imageDoc.width.value;
    var imgH = imageDoc.height.value;

    var scale = Math.max(targetW / imgW, targetH / imgH);
    imageDoc.resizeImage(UnitValue(imgW * scale, "px"), UnitValue(imgH * scale, "px"));

    imageDoc.selection.selectAll();
    imageDoc.selection.copy();
    imageDoc.close(SaveOptions.DONOTSAVECHANGES);

    var pastedLayer = internalDoc.paste();
    var dx = (targetW - (pastedLayer.bounds[2].value - pastedLayer.bounds[0].value)) / 2 - pastedLayer.bounds[0].value;
    var dy = (targetH - (pastedLayer.bounds[3].value - pastedLayer.bounds[1].value)) / 2 - pastedLayer.bounds[1].value;
    pastedLayer.translate(dx, dy);

    for (var i = internalDoc.layers.length - 1; i >= 0; i--) {
        if (internalDoc.layers[i] !== pastedLayer) {
            internalDoc.layers[i].remove();
        }
    }

    internalDoc.save();
    internalDoc.close(SaveOptions.SAVECHANGES);
}

function saveComposite(doc, path, format) {
    var file = new File(path);
    if (format === "jpg") {
        var jpgOpts = new JPEGSaveOptions();
        jpgOpts.quality = 12;
        doc.saveAs(file, jpgOpts, true);
    } else {
        var pngOpts = new PNGSaveOptions();
        doc.saveAs(file, pngOpts, true);
    }
}

var images = sourceFolder.getFiles(/\.(jpg|jpeg|png)$/i);
for (var i = 0; i < images.length; i++) {
    var imgFile = images[i];
    var fileName = imgFile.name;
    var baseName = fileName.replace(/\.[^\.]+$/, "");
    
    // ИСПРАВЛЕНИЕ: Очищаем имя файла от возможных лишних символов
    var cleanFileName = fileName.replace(/^\s+|\s+$/g, '');
    var orientation = orientationMap[cleanFileName];

    $.writeln("🧪 === ОБРАБОТКА ФАЙЛА ===");
    $.writeln("📌 FILE: [" + fileName + "]");
    $.writeln("📌 CLEAN FILE: [" + cleanFileName + "]");
    
    // Отладка поиска в orientationMap
    var matched = false;
    for (var k in orientationMap) {
        $.writeln("🧾 MAP KEY: [" + k + "] -> [" + orientationMap[k] + "]");
        if (k === cleanFileName) {
            $.writeln("✅ СОВПАДЕНИЕ НАЙДЕНО!");
            matched = true;
        }
    }
    if (!matched) {
        $.writeln("❌ НЕ НАЙДЕНО СОВПАДЕНИЯ ДЛЯ: " + cleanFileName);
    }

    if (!orientation) {
        $.writeln("⚠️ Пропущено: не найдена ориентация для " + cleanFileName);
        continue;
    }

    $.writeln("🧭 " + baseName + " → ориентация: '" + orientation + "'");

    // ИСПРАВЛЕНИЕ: Детальная отладка выбора папки
    $.writeln("🧪 === ВЫБОР ПАПКИ МАКЕТОВ ===");
    $.writeln("🧪 orientation === 'horizontal': " + (orientation === "horizontal"));
    $.writeln("🧪 orientation === 'vertical': " + (orientation === "vertical"));
    $.writeln("🧪 horizontalMockups существует: " + (horizontalMockups ? "ДА" : "НЕТ"));
    $.writeln("🧪 verticalMockups существует: " + (verticalMockups ? "ДА" : "НЕТ"));
    $.writeln("🧪 squareMockups существует: " + (squareMockups ? "ДА" : "НЕТ"));

    var mockupFolder = null;
    if (orientation === "horizontal") {
        mockupFolder = horizontalMockups;
        $.writeln("➡️ ВЫБРАНА horizontalMockups");
    } else if (orientation === "vertical") {
        mockupFolder = verticalMockups;
        $.writeln("➡️ ВЫБРАНА verticalMockups");
    } else {
        mockupFolder = squareMockups;
        $.writeln("➡️ ВЫБРАНА squareMockups");
    }

    $.writeln("➡️ ИТОГОВАЯ mockupFolder = " + (mockupFolder ? mockupFolder.fsName : "NULL"));

    // ИСПРАВЛЕНИЕ: Проверяем, что папка действительно существует
    if (!mockupFolder) {
        $.writeln("❌ Папка макетов не определена для ориентации: " + orientation);
        continue;
    }
    
    if (!mockupFolder.exists) {
        $.writeln("❌ Папка макетов не существует: " + mockupFolder.fsName);
        continue;
    }

    var mockupList = getMockupList(mockupFolder);
    $.writeln("➡️ mockupList: " + mockupList.length + " файлов в " + mockupFolder.fsName);
    for (var f = 0; f < mockupList.length; f++) {
        $.writeln("   → " + mockupList[f].name);
    }

    if (mockupList.length === 0) {
        $.writeln("⚠️ Нет PSD макетов в папке: " + mockupFolder.fsName);
        continue;
    }

    var usedIndices = {};
    for (var m = 0; m < mockupCount && m < mockupList.length; m++) {
        var candidate;
        do {
            candidate = Math.floor(Math.random() * mockupList.length);
        } while (usedIndices[candidate]);
        usedIndices[candidate] = true;

        var mockupFile = mockupList[candidate];
        $.writeln("📂 Открываем макет: " + mockupFile.name + " из папки " + mockupFolder.fsName);

        try {
            var mockupDoc = app.open(mockupFile);
        } catch (e) {
            $.writeln("❌ Ошибка открытия PSD: " + mockupFile.fsName + " → " + e);
            continue;
        }

        var smartLayer = null;
        for (var l = 0; l < mockupDoc.layers.length; l++) {
            var lyr = mockupDoc.layers[l];
            if (lyr.kind === LayerKind.SMARTOBJECT && lyr.name === "Placeholder") {
                smartLayer = lyr;
                break;
            }
        }

        if (!smartLayer) {
            $.writeln("❌ Пропущен PSD без слоя Placeholder: " + mockupFile.name);
            mockupDoc.close(SaveOptions.DONOTSAVECHANGES);
            continue;
        }

        app.activeDocument.activeLayer = smartLayer;
        executeAction(stringIDToTypeID("placedLayerEditContents"), undefined, DialogModes.NO);
        replaceSmartObjectContents(imgFile.fsName);

        if (mockupResolution !== "original") {
            mockupDoc.resizeImage(undefined, undefined, parseInt(mockupResolution));
        }

        var resultPath = targetFolder.fsName + "/" + baseName + "_mockup_" + (m + 1) + "." + mockupFormat;
        $.writeln("💾 Сохраняем результат: " + resultPath);
        saveComposite(mockupDoc, resultPath, mockupFormat);

        mockupDoc.close(SaveOptions.DONOTSAVECHANGES);
    }
}