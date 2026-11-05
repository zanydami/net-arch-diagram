# Mobile Network Architecture Diagram

Небольшое React-приложение для визуализации архитектуры мобильных сетей: 2G, 3G, 4G, 5G NSA и 5G SA.

## Что умеет

- переключать технологию по вкладкам
- отображать сетевую архитектуру в SVG-диаграмме
- выделять узлы и связи при наведении
- показывать интерфейсы и детали выбранного узла
- сохранять выбранный tech/node в URL

## Запуск

Установить зависимости:

```bash
npm install
```

Запустить проект в dev-режиме:

```bash
npm run dev
```

Приложение доступно по адресу:

```text
http://localhost:4173/
```

Собрать production-билд:

```bash
npm run build
```

Запустить preview:

```bash
npm run preview
```

## Технологии

- React
- TypeScript
- Vite
- Tailwind CSS

## Структура

- `src/App.tsx` — главная логика приложения
- `src/data/technologies.ts` — описание сетевых технологий и узлов
- `src/components/ArchitectureDiagram.tsx` — SVG-диаграмма
- `src/components/DetailPanel.tsx` — подробности выбранного элемента
- `src/components/TechnologyTabs.tsx` — переключение технологий

## Важный момент про порты

Проект настроен на фиксированный порт `4173` для стабильного запуска локально.
