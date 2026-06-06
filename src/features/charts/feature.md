# Control Chart enhancements

Adds visual aids on Jira’s **Control Chart** report: an SLA reference line with quick preview, and an optional measurement grid to read lead or cycle time against story-point-style steps.

## What it does

- Shows a horizontal **SLA** line on the chart with a shaded band, labels for days and how much work sits at or under that SLA, and an **SLA** entry in the chart legend.
- The line updates live as you change the SLA value.
- Lets board editors **save** an SLA value for the board so it comes back on later visits.
- Adds an optional **measurement grid** you can turn on in the chart options: Fibonacci or even-step presets, draggable and resizable so you can align horizontal lines with the chart.

## How to set up

1. Open **Reports** for your board and choose the **Control Chart** report.
2. In the chart options area, use the **SLA** field to set a target in **days**. The chart updates immediately.
3. To **save** that SLA for everyone who uses this board, click **Save** (only if you can edit the board).
4. For the grid: use the checkbox and preset controls in the chart options to show or hide the overlay and pick **Fibonacci** or **linear** spacing. Adjust position and size on the chart as needed.

## Behavior on the board / on the page

On the **Control Chart**, you see the usual Jira chart plus the extension’s SLA controls in the options column. When SLA is set, the chart shows the line, band, and legend text. With the grid enabled, horizontal guide lines sit over the chart so you can relate vertical positions to days and step patterns. Saved SLA appears next time you open this board’s Control Chart.
