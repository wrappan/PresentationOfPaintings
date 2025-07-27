// Updated start.jsx with full UI and step3 integration
#target photoshop

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

function saveConfig(configPath, config) {
    var configFile = new File(configPath);
    configFile.encoding = "UTF-8";
    configFile.open("w");
    var content = "{\n";
    for (var key in config) {
        content += '\"' + key + '\": \"' + config[key] + '\",\n';
    }
    content = content.slice(0, -2) + "\n}";
    configFile.write(content);
    configFile.close();
}

function createUI() {
    var dialog = new Window("dialog", "Presentation of Paintings - Создать презентацию картин v.1");
    dialog.orientation = "column";

    function addPathField(label) {
        var group = dialog.add("group");
        group.orientation = "row";
        group.add("statictext", undefined, label);
        var input = group.add("edittext", undefined, "");
        input.characters = 60;
        var button = group.add("button", undefined, "Обзор...");
        button.onClick = function () {
            var folder = Folder.selectDialog(label);
            if (folder) input.text = folder.fsName;
        };
        return input;
    }

    var folderInput = addPathField("Исходные изображения:");
    var targetInput = addPathField("Папка сохранения:");
    var textureInput = addPathField("Текстуры холста:");
    var horMockupInput = addPathField("Горизонтальные макеты:");
    var vertMockupInput = addPathField("Вертикальные макеты:");
    var squareMockupInput = addPathField("Равносторонние макеты:");

    var columnsGroup = dialog.add("group");
    columnsGroup.orientation = "row";
    columnsGroup.add("statictext", undefined, "Колонки:");
    var columnsWidthInput = columnsGroup.add("edittext", undefined, "3");
    columnsGroup.add("statictext", undefined, "× Строки:");
    var columnsHeightInput = columnsGroup.add("edittext", undefined, "2");

    var opacityGroup = dialog.add("group");
    opacityGroup.orientation = "row";
    opacityGroup.add("statictext", undefined, "Прозрачность (1-100):");
    var opacityInput = opacityGroup.add("edittext", undefined, "50");

    var formatGroup = dialog.add("group");
    formatGroup.orientation = "row";
    formatGroup.add("statictext", undefined, "Формат частей:");
    var formatRadioPNG = formatGroup.add("radiobutton", undefined, "PNG");
    var formatRadioJPG = formatGroup.add("radiobutton", undefined, "JPG");
    formatRadioPNG.value = true;

    var sizeGroup = dialog.add("group");
    sizeGroup.orientation = "row";
    sizeGroup.add("statictext", undefined, "Макс. размер:");
    var maxSizeInput = sizeGroup.add("edittext", undefined, "55");
    sizeGroup.add("statictext", undefined, "Разброс:");
    var randomOffsetInput = sizeGroup.add("edittext", undefined, "10");

    var unitGroup = dialog.add("group");
    unitGroup.orientation = "row";
    unitGroup.add("statictext", undefined, "Единицы:");
    var radioInches = unitGroup.add("radiobutton", undefined, "дюймы");
    var radioCM = unitGroup.add("radiobutton", undefined, "см");
    radioInches.value = true;

    var mockupGroup = dialog.add("group");
    mockupGroup.orientation = "row";
    mockupGroup.add("statictext", undefined, "Кол-во макетов:");
    var mockupCountInput = mockupGroup.add("edittext", undefined, "1");
    mockupGroup.add("statictext", undefined, "Формат:");
    var mockupRadioPNG = mockupGroup.add("radiobutton", undefined, "PNG");
    var mockupRadioJPG = mockupGroup.add("radiobutton", undefined, "JPG");
    mockupRadioPNG.value = true;

    var resGroup = dialog.add("group");
    resGroup.orientation = "row";
    resGroup.add("statictext", undefined, "Разрешение макетов:");
    var mockupResDropdown = resGroup.add("dropdownlist", undefined, ["original", "300", "96", "72"]);
    mockupResDropdown.selection = 0;

    var configGroup = dialog.add("group");
    configGroup.orientation = "row";
    var saveConfigButton = configGroup.add("button", undefined, "Сохранить конфиг");
    var loadConfigButton = configGroup.add("button", undefined, "Загрузить конфиг");
    var configNameInput = configGroup.add("edittext", undefined, "default_config.json");

    var buttonGroup = dialog.add("group");
    buttonGroup.orientation = "row";
    var startButton = buttonGroup.add("button", undefined, "Пуск");
    var closeButton = buttonGroup.add("button", undefined, "Закрыть");

    function collectConfig() {
        return {
            folder: folderInput.text,
            targetFolder: targetInput.text,
            textureFolder: textureInput.text,
            horizontalMockups: horMockupInput.text,
            verticalMockups: vertMockupInput.text,
            squareMockups: squareMockupInput.text,
            columnsWidth: columnsWidthInput.text,
            columnsHeight: columnsHeightInput.text,
            opacity: opacityInput.text,
            format: formatRadioPNG.value ? "png" : "jpg",
            maxSize: maxSizeInput.text,
            randomOffset: randomOffsetInput.text,
            units: radioInches.value ? "in" : "sm",
            mockupCount: mockupCountInput.text,
            mockupFormat: mockupRadioPNG.value ? "png" : "jpg",
            mockupResolution: mockupResDropdown.selection.text
        };
    }

    saveConfigButton.onClick = function () {
        var config = collectConfig();
        var configPath = "D:/project/absentia8/" + configNameInput.text;
        saveConfig(configPath, config);
        alert("Конфиг сохранен: " + configPath);
    };

    loadConfigButton.onClick = function () {
        var configPath = "D:/project/absentia8/" + configNameInput.text;
        var config = loadConfig(configPath);
        if (!config) {
            alert("Конфиг не найден!");
            return;
        }
        folderInput.text = config.folder || "";
        targetInput.text = config.targetFolder || "";
        textureInput.text = config.textureFolder || "";
        horMockupInput.text = config.horizontalMockups || "";
        vertMockupInput.text = config.verticalMockups || "";
        squareMockupInput.text = config.squareMockups || "";
        columnsWidthInput.text = config.columnsWidth || "3";
        columnsHeightInput.text = config.columnsHeight || "2";
        opacityInput.text = config.opacity || "50";
        maxSizeInput.text = config.maxSize || "55";
        randomOffsetInput.text = config.randomOffset || "10";
        radioInches.value = config.units !== "sm";
        radioCM.value = config.units === "sm";
        formatRadioPNG.value = config.format !== "jpg";
        formatRadioJPG.value = config.format === "jpg";
        mockupCountInput.text = config.mockupCount || "1";
        mockupRadioPNG.value = config.mockupFormat !== "jpg";
        mockupRadioJPG.value = config.mockupFormat === "jpg";
        mockupResDropdown.selection = mockupResDropdown.find(config.mockupResolution) || mockupResDropdown.items[0];
        alert("Конфиг загружен: " + configPath);
    };

    startButton.onClick = function () {
        var config = collectConfig();
        var tempConfigPath = "D:/project/absentia8/temp_config.json";
        saveConfig(tempConfigPath, config);
        var id = stringIDToTypeID("AdobeScriptAutomation Scripts");
        function runScript(path) {
            var desc = new ActionDescriptor();
            desc.putPath(charIDToTypeID("jsCt"), new File(path));
            desc.putString(charIDToTypeID("jsMs"), "undefined");
            executeAction(id, desc, DialogModes.NO);
        }
		runScript("D:/project/absentia8/jsx/orientation.jsx");
        runScript("D:/project/absentia8/jsx/step1.jsx");
        runScript("D:/project/absentia8/jsx/step2.jsx");
        runScript("D:/project/absentia8/jsx/step3.jsx");
        dialog.close();
    };

    closeButton.onClick = function () {
        dialog.close();
    };

    dialog.show();
}

createUI();
