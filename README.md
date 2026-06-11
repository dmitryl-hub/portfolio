# Дмитрий Ларионов | Портфолио

Персональный сайт-портфолио и резюме. Спроектирован как SPA с упором на производительность, адаптивность и удобство кастомизации через JSON-конфиги.

| Ресурс | URL |
|---|---|
| **GitHub Pages** | [dmitryl-hub.github.io/portfolio](https://dmitryl-hub.github.io/portfolio/) |

---

## Стек

| Слой | Технология |
|---|---|
| **Фреймворк** | React 18 |
| **Сборка** | Vite 6 |
| **Стили** | SCSS + Bootstrap 5 |
| **Иконки** | Font Awesome 6, PrimeIcons |
| **Почта** | EmailJS (без бэкенда) |
| **Скролл** | Smooth Scrollbar |
| **Слайдеры** | Swiper 11 |
| **Линтинг** | ESLint 9 |

## Возможности

- Тёмная и светлая темы (CSS custom properties)
- Русский и английский языки (автоопределение + localStorage)
- Адаптивный дизайн (десктоп — боковая панель, мобильный — нижняя навигация)
- Плавные переходы между секциями
- Ленивая загрузка данных
- Безсерверная контактная форма (EmailJS)
- Кастомный скроллбар
- Полностью конфигурируется через JSON

---

## Начало работы

```bash
npm install
npm run dev       # dev-сервер с HMR
npm run build     # production-сборка в dist/
npm run preview   # превью собранного сайта
```

## Структура проекта

```
src/
├── components/       # React-компоненты
│   ├── layout/       # Оболочка, навигация, слайдшоу
│   ├── sections/     # Секции и Article-компоненты
│   └── Portfolio.jsx # Корневой компонент
├── providers/        # 8 React Context-провайдеров
├── hooks/            # Кастомные хуки и утилиты
├── styles/           # SCSS с CSS-переменными темизации
└── main.jsx          # Точка входа
public/
├── data/             # Контент в JSON
│   ├── settings.json
│   ├── strings.json
│   ├── profile.json
│   ├── sections.json
│   └── sections/     # Контент каждой секции
├── images/           # Изображения
└── documents/        # PDF-резюме
```

## JSON-driven архитектура

Весь контент хранится в статических JSON-файлах в `public/data/`. React-компоненты резолвятся динамически по имени из JSON-поля `component`. Это позволяет менять контент, секции и даже типы компонентов без изменения кода.

**Навигация** — хеш-базированная (без React Router). `LocationProvider` слушает `hashchange` и `popstate`, URL вида `#experience` загружает соответствующую секцию.

**Темизация** — CSS custom properties. Атрибут `data-theme="dark"|"light"` на `<html>` переключает все `--theme-*` переменные.

**i18n** — JSON-файлы с поддержкой разметки (`{{highlight}}`, `[[bold]]`). Язык определяется автоматически и сохраняется в localStorage.

---

## Деплой

### GitHub Pages (автоматически)

При пуше в ветку `master` GitHub Actions собирает проект и деплоит на GitHub Pages:

```bash
git push github master
```


---

## Кастомизация контента

Все данные сайта — в `public/data/`. Основные файлы:

| Файл | Что содержит |
|---|---|
| `settings.json` | Глобальные настройки, темы, языки |
| `profile.json` | Имя, роли, статус |
| `strings.json` | Все тексты интерфейса (i18n) |
| `sections.json` | Список и порядок секций |
| `sections/*.json` | Контент каждой секции |