# Линия SLA

| | |
|---|---|
| Где настраивается | «Отчёты» → «Контрольная диаграмма» → поле «SLA» в опциях диаграммы |
| Где видно | «Отчёты» («Контрольная диаграмма») |
| Настройки действуют | Для всей команды |(`slaConfig3`) |

## Цель

Добавить на отчёт Control Chart горизонтальную опорную линию SLA с затенённой полосой процентиля и записью в легенде, помогая командам оценивать, сколько работы укладывается в целевой SLA.

<div class="feature-mockup">
  <div class="mockup-board">
    <div style="position:relative;height:120px;padding:8px 20px 20px 30px;">
      <div style="position:absolute;left:30px;bottom:20px;right:20px;top:8px;">
        <div style="position:absolute;left:10%;bottom:10%;width:6px;height:6px;background:#4c9aff;border-radius:50%"></div>
        <div style="position:absolute;left:20%;bottom:30%;width:6px;height:6px;background:#4c9aff;border-radius:50%"></div>
        <div style="position:absolute;left:30%;bottom:25%;width:6px;height:6px;background:#4c9aff;border-radius:50%"></div>
        <div style="position:absolute;left:40%;bottom:50%;width:6px;height:6px;background:#4c9aff;border-radius:50%"></div>
        <div style="position:absolute;left:50%;bottom:40%;width:6px;height:6px;background:#4c9aff;border-radius:50%"></div>
        <div style="position:absolute;left:60%;bottom:60%;width:6px;height:6px;background:#4c9aff;border-radius:50%"></div>
        <div style="position:absolute;left:70%;bottom:45%;width:6px;height:6px;background:#4c9aff;border-radius:50%"></div>
        <div style="position:absolute;left:80%;bottom:70%;width:6px;height:6px;background:#4c9aff;border-radius:50%"></div>
        <div style="position:absolute;left:0;right:0;bottom:75%;border-top:2px dashed #ff5630"></div>
        <div style="position:absolute;right:0;bottom:72%;font-size:0.55rem;color:#ff5630;font-weight:600;">SLA 85%</div>
      </div>
    </div>
  </div>
</div>

## Как настроить

### Где найти настройки

1. Откройте **«Отчёты»** для доски и выберите **«Контрольная диаграмма»**.

### Как настроить

- **«Задать значение SLA»**: в колонке опций диаграммы найдите поле ввода **«SLA»** и введите целевое значение в **днях**. Диаграмма обновляется мгновенно, показывая зелёную опорную линию и затенённую полосу.

Нажмите **«Сохранить»**, чтобы сохранить значение SLA для всех пользователей доски. Значение хранится как свойство доски Jira.

Линию SLA можно временно изменить через URL-параметр `sla` без сохранения — удобно для быстрого анализа «что если».

## Как использовать

- На диаграмме появляется горизонтальная зелёная линия на позиции SLA.
- Полупрозрачная зелёная полоса показывает диапазон процентиля задач, находящихся на уровне или ниже SLA.
- Подпись линии показывает два значения: SLA в днях (например, `5d`) и процент задач на уровне или ниже SLA (например, `85%`).
- В легенду диаграммы добавляется запись **«SLA»**.
- Изменение значения в поле ввода обновляет диаграмму в реальном времени — используйте это для изучения разных целевых значений перед фиксацией.

## Сценарии использования

- **Проверка соблюдения SLA:** Оценить, какой процент задач соответствует целевому SLA команды.
- **Анализ «что если»:** Временно изменить SLA через URL-параметр для изучения пороговых эффектов без сохранения.
- **Улучшение процесса:** Отслеживать изменение соблюдения SLA с течением времени, возвращаясь к диаграмме с фиксированным базовым SLA.
- **Отчётность:** Использовать данные процентиля для отчёта о соблюдении SLA перед заинтересованными сторонами.

## См. также

- [Измерительная сетка](/docs/features/control-chart/scale-ruler)
