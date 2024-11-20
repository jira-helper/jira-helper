Plan:
- [x] firefox image loading
- [x] storybook stories
- [-] storybook screenshots
- [x] unit tests for container
- [x] test of filling a card with colors
- [x] storybook with filled card
- [ ] Firefox падает шим на resizeObserver по CSP, потому что шип пробует получить глобал через `Function('return this')`. Надо или не тянуть полифил рисайз обсервера (но это временное решение по сути), либо грузить как-то скрипт так чтобы CSP не бунтовал ИЛИ чтобы получение глобала по другому отработало. Смотреть node_modules/resize-observer-polyfill/dist/ResizeObserver.js