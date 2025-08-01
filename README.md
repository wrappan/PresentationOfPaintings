# 🎨 PresentationOfPaintings

> Автоматизация генерации интерьерных mockup-изображений с картинами разной ориентации для Adobe Photoshop.

## 📌 Описание

Скрипт `PresentationOfPaintings.jsx` и вспомогательные модули позволяют:
- Разделить изображение картины на равные части;
- Наложить текстуру холста на части и на оригинал;
- Вставить итоговое изображение в макеты интерьеров PSD в зависимости от ориентации;
- Получить реалистичные mockup-изображения для портфолио, онлайн-магазина, презентации.

## 🛠 Требования

- Adobe Photoshop 25.12.0+
- Windows 10 x64
- Поддержка JSX (ExtendScript)

## 📂 Структура проекта

- `jsx/` — скрипты обработки (step1, step2, step3 и UI)
- `default_config.json` — сохранённые параметры
- `temp_config.json` — временные настройки для запуска
- `Исходные файлы/` — папки с картинами, текстурами и PSD-макетами
- `orientations.json` — данные о соотношении сторон изображений

## 🚀 Как использовать

1. Открой `start.jsx` в Photoshop.
2. Укажи пути к изображениям, макетам, текстурам.
3. Настрой параметры генерации: размеры, DPI, ориентации.
4. Нажми **Пуск** — автоматически выполняются шаги:
   - `orientation.jsx` — определяет ориентации;
   - `step1.jsx` — нарезка частей;
   - `step2.jsx` — текстуры и переименование;
   - `step3.jsx` — вставка в PSD mockup.

Итоговые изображения сохраняются в папку `Result/`.

## 🧩 Скрипты

| Скрипт             | Назначение                         |
|--------------------|------------------------------------|
| `start.jsx`        | UI-окно со всеми настройками       |
| `step1.jsx`        | Нарезка изображения на части       |
| `step2.jsx`        | Наложение текстур и генерация размеров |
| `step3.jsx`        | Вставка в PSD-макеты               |
| `orientation.jsx`  | Определение ориентации (простой)   |
| `scan_orientation.jsx` | Точная ориентация через Photoshop |

## 📸 Примеры

Примеры картин:
- `horizontal.png`
- `vertical.png`
- `kvadrat.png`

Примеры текстур: `texture1.jpg` … `texture5.jpg`  
Макеты PSD разбиты по ориентациям.

---

## 🧷 TODO (по желанию)

- Добавить эффект лака / шумов через UI
- Поддержка нескольких стилей оформления
- Поддержка batch-рендеринга mockup'ов

---

## 📄 Лицензия

MIT.
