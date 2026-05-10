# SLA Line

| | |
|---|---|
| Где настраивается | Reports → Control Chart → SLA input field in chart options |
| Где видно | Reports (Control Chart) |
| Settings apply to | For the whole team |(`slaConfig3`) |

## Цель

Add a horizontal SLA reference line to the Control Chart report with a shaded percentile band and legend entry, helping teams assess how much work meets the SLA target.

## Как настроить

### How to open settings

1. Open **Reports** for your board and select the **Control Chart**.
2. In the chart options column, find the **SLA** input field.

### What you can configure

- **Set SLA target**: enter a target value in **days**. The chart updates immediately, showing a green reference line and shaded band.

Click **Save** to persist the SLA value for everyone using this board. The value is stored as a Jira board property.

The SLA line can also be changed temporarily via the URL parameter `sla` without saving — useful for quick "what-if" analysis.

## Как использовать

- A green horizontal line appears at the SLA position on the chart.
- A translucent green band spans the percentile range of issues at or below the SLA.
- The line label shows two values: the SLA in days (e.g. `5d`) and the percentage of issues at or below that SLA (e.g. `85%`).
- An **SLA** entry is added to the chart legend for clarity.
- Changing the input value updates the chart live — use this to explore different SLA targets before committing.

## Сценарии использования

- **SLA compliance review:** Check what percentage of issues meet the team's SLA target.
- **What-if analysis:** Temporarily adjust SLA via the URL parameter to explore threshold effects without saving.
- **Process improvement:** Track how SLA compliance changes over time by revisiting the chart with a fixed SLA baseline.
- **Reporting:** Use the percentile data to report SLA adherence to stakeholders.

## Устранение неполадок

- **SLA line not appearing:** Ensure the Control Chart has finished loading (all data points visible). The chart SVG must be fully rendered.
- **Save button disabled:** You may not have permission to edit the board. The SLA value can still be used temporarily.
- **Wrong percentile:** The percentile is calculated from visible chart data points. Ensure the chart shows the full dataset.
- **Input not responding:** Check for browser console errors. The SLA input is injected into the Jira chart options panel.

## См. также

- [Scale Ruler](/docs/features/control-chart/scale-ruler)
