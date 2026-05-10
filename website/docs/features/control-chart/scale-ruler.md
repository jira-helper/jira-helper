# Scale Ruler (Measurement Grid)

| | |
|---|---|
| Где настраивается | Reports → Control Chart → Grid checkbox and preset selector in chart options |
| Где видно | Reports (Control Chart) |
| Settings apply to | Only for you (session) |

## Цель

Overlay a draggable, resizable measurement grid on the Control Chart to read lead or cycle time against story-point-style steps (Fibonacci or linear presets), making it easier to estimate days from chart position.

## Как настроить

1. Open **Reports** for your board and select the **Control Chart**.
2. In the chart options column, find the **Grid** checkbox and select a preset from the dropdown.
3. Choose a preset: **Fibonacci** (1,2,3,5; 1,2,3,5,8; 1,2,3,5,8,13) or **Linear** (2-10 steps).
4. The grid overlay appears on the chart. Drag it to reposition and use the resize handle (bottom-right corner) to adjust its size.

The grid state is session-only and resets on page reload. This feature is not supported in Firefox.

## Как использовать

- Horizontal guide lines appear within the draggable overlay, labeled with story points (SP) and corresponding days.
- Each line represents a step in the selected sequence, helping you estimate how many days correspond to a given SP value.
- Drag the overlay to align grid lines with chart data points for visual estimation.
- Resize the overlay to fit different areas of the chart.
- Disable the grid by unchecking the checkbox.

## Сценарии использования

- **Story point calibration:** Align Fibonacci steps with the chart to calibrate team estimates against actual cycle time.
- **Quick estimation:** Use linear steps to estimate cycle time for tasks of varying sizes.
- **Presentation aid:** Use the grid during team discussions to visualize time distributions.
- **Process analysis:** Overlay different presets to find the best fit for the team's delivery patterns.

## Устранение неполадок

- **Grid not appearing:** This feature is not supported in Firefox. In Chrome, ensure the checkbox is checked after the chart loads.
- **Grid lines misaligned:** Drag the overlay to reposition. The grid lines recalculate based on the overlay's position and size.
- **Preset not changing:** Select a different preset from the dropdown; the lines update immediately.
- **Resize handle not responding:** The resize handle is in the bottom-right corner of the overlay. Ensure the overlay is visible and drag the corner.

## См. также

- [SLA Line](/docs/features/control-chart/sla-line)
