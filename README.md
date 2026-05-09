# Хамелеон / Аквапринт

Лендинг детейлинг-студии «Хамелеон» (г. Ухта) — аквапринт, антихром, окрашивание, восстановление.

Статический сайт (HTML + CSS + ES-модули, без сборщика).

## Локальный запуск

```bash
python3 -m http.server 5173
```

Открыть [http://localhost:5173](http://localhost:5173).

## Структура

```
index.html        — разметка
styles.css        — стили
src/app.mjs       — JS (анимации, форма, скролл-spy, маска телефона и пр.)
assets/figma/     — изображения, иконки, фото работ
```

## Деплой на GitHub Pages

1. Запушить в репозиторий на GitHub.
2. Settings → Pages → Source: «Deploy from a branch» → Branch: `main` / `(root)`.
3. Подождать 1-2 минуты, сайт будет на `https://<username>.github.io/<repo>/`.

Сборки не требуется — Pages раздаст файлы как есть.
