// Простая реализация JSON.stringify для старых версий
if (typeof JSON === 'undefined') {
    JSON = {};
    JSON.stringify = function(obj) {
        if (obj === null) return 'null';
        if (typeof obj === 'number') return String(obj);
        if (typeof obj === 'boolean') return obj ? 'true' : 'false';
        if (typeof obj === 'string') return '"' + obj.replace(/"/g, '\\"') + '"';
        
        var isArray = obj instanceof Array;
        var fragments = [];
        
        if (isArray) {
            for (var i = 0; i < obj.length; i++) {
                fragments.push(JSON.stringify(obj[i]));
            }
            return '[' + fragments.join(',') + ']';
        } else {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    fragments.push('"' + key + '":' + JSON.stringify(obj[key]));
                }
            }
            return '{' + fragments.join(',') + '}';
        }
    };
}

// Функция загрузки конфигурации
function loadConfig(path) {
    var file = new File(path);
    if (!file.exists) {
        alert("Файл конфигурации не найден: " + path);
        return null;
    }
    
    file.open("r");
    var str = file.read();
    file.close();
    
    var obj = {};
    try {
        // Удаляем возможные BOM и лишние пробелы
        str = str.replace(/^\uFEFF/, '').replace(/^\s+|\s+$/g, '');
        
        // Исправляем экранированные слеши для Windows путей
        str = str.replace(/\\\\/g, '/').replace(/\\/g, '/');
        
        // Попробуем eval для парсинга JSON
        obj = eval('(' + str + ')');
        $.writeln("✅ Конфигурация загружена успешно");
        
        // Выводим загруженные пути для отладки
        $.writeln("📁 Папка с изображениями: " + obj.folder);
        
    } catch (e) {
        $.writeln("⚠️ Ошибка парсинга JSON, используем fallback: " + e);
        // Fallback на простой regex парсинг
        str.replace(/"([^\"]+)":\s*"([^\"]*)"/g, function (_, key, value) {
            // Исправляем пути
            value = value.replace(/\\\\/g, '/').replace(/\\/g, '/');
            obj[key] = value;
        });
    }
    
    return obj;
}

// Функция проверки расширения файла
function isImageFile(filename) {
    var ext = filename.split('.').pop().toLowerCase();
    return ext === 'jpg' || ext === 'jpeg' || ext === 'png' || 
           ext === 'psd' || ext === 'tif' || ext === 'tiff' || 
           ext === 'bmp' || ext === 'gif';
}

// Главная функция
function main() {
    try {
        // Загружаем конфигурацию
        var configPath = "D:/project/absentia8/temp_config.json";
        var config = loadConfig(configPath);
        
        if (!config) {
            alert("Не удалось загрузить конфигурацию из: " + configPath);
            return;
        }
        
        if (!config.folder) {
            alert("В конфигурации не указан путь к папке с изображениями (поле 'folder')");
            return;
        }
        
        // Создаем объект папки из конфига
        var folderPath = config.folder.replace(/\//g, '\\'); // Конвертируем в Windows-формат
        var folder = new Folder(folderPath);
        
        if (!folder.exists) {
            alert("Папка с изображениями не существует: " + folderPath);
            return;
        }
        
        $.writeln("🚀 Начинаем обработку папки: " + folder.fsName);
        
        var results = [];
        var files = folder.getFiles();
        var processedCount = 0;
        
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if (file instanceof File && isImageFile(file.name)) {
                try {
                    $.writeln("📸 Обрабатываем: " + file.name);
                    
                    // Открываем изображение
                    open(file);
                    var doc = app.activeDocument;
                    
                    // Получаем размеры
                    var width = Math.round(doc.width.as("px"));
                    var height = Math.round(doc.height.as("px"));
                    
                    // Определяем ориентацию
                    var orientation = "square";
                    var ratio = width / height;
                    
                    if (Math.abs(1 - ratio) > 0.01) {
                        orientation = width > height ? "horizontal" : "vertical";
                    }
                    
                    // Добавляем результат
                    results.push({
                        filename: file.name,
                        width: width,
                        height: height,
                        orientation: orientation
                    });
                    
                    $.writeln("   → " + width + "x" + height + " → " + orientation);
                    processedCount++;
                    
                    // Закрываем без сохранения
                    doc.close(SaveOptions.DONOTSAVECHANGES);
                } catch (e) {
                    $.writeln("❌ Ошибка обработки файла: " + file.name + " → " + e.message);
                }
            }
        }
        
        // Сохраняем результаты
        if (results.length > 0) {
            var outputFile = new File("D:/project/absentia8/orientations.json");
            outputFile.encoding = "UTF-8";
            outputFile.open("w");
            outputFile.write(JSON.stringify(results));
            outputFile.close();
            
            $.writeln("✅ Обработка завершена!");
            $.writeln("📊 Статистика:");
            $.writeln("   Всего файлов: " + files.length);
            $.writeln("   Обработано изображений: " + processedCount);
            $.writeln("   Результат сохранен в: orientations.json");
            
            // Показываем сводку по ориентациям
            var horizontal = 0, vertical = 0, square = 0;
            for (var i = 0; i < results.length; i++) {
                switch (results[i].orientation) {
                    case "horizontal": horizontal++; break;
                    case "vertical": vertical++; break;
                    case "square": square++; break;
                }
            }
            
            var summary = "Успешно обработано: " + results.length + " изображений\n\n" +
                         "Горизонтальных: " + horizontal + "\n" +
                         "Вертикальных: " + vertical + "\n" +
                         "Квадратных: " + square + "\n\n" +
                         "Результаты сохранены в orientations.json";
            
            // alert(summary); // ← отключено, чтобы не мешать дальнейшему запуску
        } else {
            alert("В папке не найдено подходящих изображений\nПапка: " + folder.fsName);
        }
    } catch (e) {
        alert("Критическая ошибка:\n" + e.message + "\nСтрока: " + e.line);
    }
}

// Запускаем скрипт
main();