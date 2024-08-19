# Функционал расширения "jira-helper"

[eng](./index.md)

## swimlane Chart Bar

Работает в заголовках Swimlane.

При наведении курсора мыши на bar всплывает подсказка (title) в которой показывается название
ассоциированной колонки доски с bar и количество задач в этой колонке для этого swimlane.

![Chart Bar](https://raw.githubusercontent.com/pavelpower/jira-helper/images/features/jirahelper_ChartBar.gif)

Удобно использовать при большом количестве swimlane.

Например, когда swimlane используются для отображения задач по Epic или Stories или Assigne.

![Settings Base swimlane on](https://raw.githubusercontent.com/pavelpower/jira-helper/images/features/jirahelper_swimlane_base_swimlanes_on.gif)


## Flag on Issue panel

На board по клику правой кнопкой мыши можно добавлять красный флажок к задаче.

Данный флажок не показывается на панели задач (`jira.server.com/browse/PROJECTID-0001`).

Плагин **jira-helper** добавляет отображение флажка на панели задач рядом сo значением поля `priority`

Пример JIRA Cloud:

![issue flag jira cloud](https://github.com/pavelpower/jira-helper/raw/images/features/jirahelper_issue_flag.gif)

Пример JIRA v7.\*.\*:

![issue flag jira 7](https://raw.githubusercontent.com/pavelpower/jira-helper/images/features/jirahelper_issue_flag_jira7.gif)


## Template for Description

При редактировании поля `Description` во время создания задач и их редактирования, рядом с полем появляются две кнопки.

При помощи которых можно сохранить Template для этого типа задач к себе в localStorage браузера (шаблон сохранится к на вашем компьютере).

![description template](https://raw.githubusercontent.com/pavelpower/jira-helper/images/features/jirahelper_description_template.gif)

## WIP-limits for several columns (CONWIP)
_WIP – work in progress_

В JIRA можно добавлять wip-ограничения только отдельно на каждую колонку.

Для визаулизации Kanban-системы необходима возможность сделать [wip-ограничение на несколько колонок](http://kanbanguide.ru/essential-condenced-kanban-guide/).

**jira-helper** добавляет такой функционал.

Чтобы им воспользоваться, необходимо в настройках доски указать какие колонки будут использовать одно wip-ограничение.

Сохранять значение может только Администратор board.

_"Board Settings -> Columns"_

![settings wip-limit for column](https://raw.githubusercontent.com/pavelpower/jira-helper/images/features/group-wip-limit.gif)

При этом, можно пользоваться функциональностью ограничений колонок предоставленной JIRA!

На board визаулизация ограничений будет поверх заголовков колонок.

При нарушении wip-limit background колонки подсветиться красным цветом.

С версии [2.1.0](https://github.com/pavelpower/jira-helper/releases/tag/2.1.0) возможно учитывать или не учитывать запросы типа sub-task в CONWIP лимитах.

Для этого нужно выбрать соответствующую настройку "Column Constraint"
![sub-task & CONWIP](https://raw.githubusercontent.com/pavelpower/jira-helper/images/features/jirahelper_CONWIP_with_sub-task.gif)


## WIP-limits for Swimlanes

Канбан-система может использовать разные ограничения WIP. В том числе и ограничения на swimlane.

Существуют swimlane особого типа, например Expedite, для которых WIP-ограничение действует только то, которое указано на swimlane.

При этом ограничения на колонках не учитывают задачи которые находятся в Expedite колонке.

При настройке wip-ограничений для swimlane посредством **jira-helper** вы можете указать какие swimlane у вас являются особенными и задачи в них не нужно использовать в подсчете количества задач для общего ограничения на колонках.

Сохранять значение может только Администратор board.

_"Board Settings -> Swimlane"_
![swimlane wip-limits](https://github.com/pavelpower/jira-helper/blob/images/features/jirahelper_wip_limit_settings_swim_ex.gif)

Используя комбинацию wip-ограничений колонок и swimlane вы можете визуализировать управление сложной системой с разными типами и классами задач.

## WIP-limit for Person

Использование ограничение на человека используется в прото-Канбан системе.

Вы можете установить WIP-limit на человека если войдете в настройки колонок на доске.

При этом, вы можете указать в каких колонках и swimlane учитывать какой вам нужно WIP-лимит на человека.


## WIP-limit for Field Value

Используйте ограничение указанное по значению поля.
В разделе настройки доски (Configure), влкадка "Card Layout", появляеться кнопка "Edit WIP limits by field"

Нажмите ее и сможете настроить WIP-лимит по значению полей которые видны на "Kanban board".

Где
* `Field` — можно выбрать по какому полю будет проверятся значение
* `Field Value` — какое значение должно совпасть со значением на карточке, чтобы оно было учтено в WIP-лимите
* `Visual Name` — какое имя показать над доской, где будет показано значение "количество/wip-limit)
* `WIP Limit` — значение ограничения, при превышении которого, карточки будут подсвечены красным цветом
* `Columns / Swimlane` — для какого пересечения колонок и swimlane учитывать это ограничение

В обычном режиме считается количество карточек которое имеет значение `Field Value` для поля `Field`.

### WIP-limit by count Field Value
Данный тип ограничения можно использовать для реализации практики **Capacity Allocation**.

В рамках этой практики, необходимо учесть тот случай, когда на карточке можно указать сколько ресурсов команды будет затрачено,
и каких именно ресурсов. А так же можно указать какая именно команда будет тартить свои ресурсы.

Чтобы воспользвоаться этой практикой используйте специальный режим работы `WIP-limit for Field Value` 
в котором будет учитыватся **не количество** карточек со значением `Field Value`, а количество значений в карточках.

Чтобы использвоать этот режим, вам надо в поле `Field Value` перед значением ввести символ `∑`, пример:

`Field Value` = `∑Frontend` 

Теперь в карточках в видемом поле на доске можно указать значения через запятую:

* карточка 1: `Frontend, Backend, Design`
* карточка 1: `Backend, Design`
* карточка 3: `Frontend, Design`
* карточка 4: `Frontend, Frontend, Design`

Подсчитанная сумма будет `Frontend` = `4`

Так же, в случае если карточка будет требовать больше ресурсов, то можно их учесть не только перечислением, но и числом

* карточка 1: `Frontend, Backend, Design`
* карточка 1: `Backend, Design`
* карточка 3: `Frontend, Design`
* карточка 4: `Frontend^3, Design`

В этом случае значение `Frontend^3` будет эквивалентно `Frontend, Frontend, Frontend`.

И в этом случае подсчитанная сумма будет `Frontend` = `5`

### WIP-limit by number field value

Можно настройить так, чтобы использовать численные значения и суммировать их.
Например, если у вас есть воле Story Points, в котором вы задаете численные значения.

Давайте рассмотрим пример.

Пусть наша доска имеет несколько колонок `Planned`, `In Progress`, `Done`;
И наша задача ограничить количество задач в `Planned` по сумме `Story Points` не более 10,
А для колонки `In Progress` не более 5.

Тогда мы зададим 2-а WIP-limit по значению поля:

Первое будет с настройками
* `Field` = `Story Points`
* `Field Value` = `∑(A)`
* `Visual Name` = `To Do`
* `WIP Limit` = `10`
* `Columns` = `Planned`
* `swimlane` — выбрать все

А второе будет с настройками
* `Field` = `Story Points`
* `Field Value` = `∑(B)`
* `Visual Name` = `In Progress`
* `WIP Limit` = `5`
* `Columns` = `In Progress`
* `swimlane` — выбрать все

Значение `Field Value` указанное как `∑(`<любая буква>`)` — подсказывает, что надо суммировать
числовые значения для jira-helper. А буквы нужно ставить разные, потому, что значение поля это часть 
ключа по которому определяется запись в настройках.

Т.е. для задания нового ограничения нужно будет выбрать не поавторяющуюся букву.

## SLA-line for Control Chart

_Control Chart - это наверное то, за что можно любить JIRA._

[Доклад "Control Chart в JIRA, все ее тайны" с конференции https://kanbaneurasia.com/](https://www.dropbox.com/sh/wkuk3n1xx4yld0w/AADvVyFtucbRpQp0wiiiOUkZa?dl=0&fbclid=IwAR3NIhkRDAGytpuTmmqbjpq7eC-01Ko3KLVM8szZmS3VNsW44qlZq2tzXsQ&preview=%D0%9F%D0%B0%D0%B2%D0%B5%D0%BB+%D0%90%D1%85%D0%BC%D0%B5%D1%82%D1%87%D0%B0%D0%BD%D0%BE%D0%B2+-+Control+Chart+%D0%B2+JIRA%2C+%D0%B2%D1%81%D0%B5+%D0%B5%D0%B5+%D1%82%D0%B0%D0%B9%D0%BD%D1%8B.pdf)

**jira-helper** добавляет специальную линию SLA на график Control Chart.

Используя эту линию вы можете задать желаемый уровень времени обслуживания выполнения задач для вашего сервиса, команды.

Сохранять значение может только Администратор board.

Кроме этого используя эту линию, без использования сохранения, вы можете анализировать время выполнения и граничные условия на графике.

Значение SLA указано в днях.

![sla-line for control chart](https://raw.githubusercontent.com/pavelpower/jira-helper/images/features/jirahelper_sla_for_controlchart.gif)

А возле линии SLA, начиная с версии [2.6.0](https://github.com/pavelpower/jira-helper/releases/tag/2.6.0)
вы можете видите процентиль, рассчитанный по количеству событий на контрольной диаграмме.
![sla-line for control chart](https://raw.githubusercontent.com/pavelpower/jira-helper/images/features/control_chart_sla_with_percentile.png)

## Ruler of measuring for control chart

Функция наложения линейки измерений на контрольную карту.

Для возможности проанализировать размерность задач можно использовать линейку измерений.

Чтобы проверить гипотизу о возможности использования различных измерений, например функции Фиббоначи или иных функций для оценки задач вашего проекта, можно воспользоваться данной функциональностью.

Выбирите функцию в выпадающем поле `Ruler`, рядом с полем `SLA`, и укажите исследуемую размерность.

_На картинке использована функция Фиббоначи, размерность "6"_
![Fibonacci distribution](https://raw.githubusercontent.com/pavelpower/jira-helper/images/features/control_chart_ruler_selected_type.png)

Можем видеть как время затраченное на выполнение здач **не** соответсвует размерности, функция Фиббоначи не подходит для оценки задач.
![Fibonacci distribution](https://raw.githubusercontent.com/pavelpower/jira-helper/images/features/control_chart_ruler_switch_on.png)

## Blurring of secret data

Если вам необходимо скрыть данные о ваших задачах, но показать модель вашей визуализации коллегам,
то вы можете размыть эти данные через контекстное меню включив функцию "blur secret data"

![the blurring of secret data](https://raw.githubusercontent.com/pavelpower/jira-helper/images/features/call_context_menu_use_blurre_secret_data.png)

Результат
![secret data is blurred](https://raw.githubusercontent.com/pavelpower/jira-helper/images/features/blurred_secret_data.png)


## Identity request from Jira-Helper

Your administrators of JIRA can identify requests from jira-helper by the special request header
"browser-plugin: jira-helper/{version}".

![jira-helper-reques](https://raw.githubusercontent.com/pavelpower/jira-helper/images/features/jira-helper-request_300px.png)

## Wip limit on cell

Функция позволяет визуализировать ограничения на ячейку / несколько ячеек(не обязательно, смежных).
Ячейкой считается пересеение колонки и свимлайна. 

Ячейку можно сделать "отключенной". т.е. у ячейки будет изменен фон, для визуализации того, что данная ячейка не используется. 
