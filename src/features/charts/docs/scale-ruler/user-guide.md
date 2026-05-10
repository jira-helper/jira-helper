# Scale Ruler (Measurement Grid)

| | |
|---|---|
| Где настраивается | «Reports» → «Control Chart» → «Grid» checkbox and preset selector in chart options |
| Где видно | Reports (Control Chart) |
| Settings apply to | Only for you (session) |

## Purpose

Overlay a draggable, resizable measurement grid on the Control Chart to read lead or cycle time against story-point-style steps (Fibonacci or linear presets), making it easier to estimate days from chart position.


<div class="feature-mockup">
  <div class="mockup-board">
    <div style="position:relative;height:100px;padding:8px 20px 20px 30px;">
      <div style="position:absolute;left:30px;bottom:20px;right:20px;top:8px;">
        <div style="position:absolute;left:0;right:0;bottom:25%;border-top:1px dashed #dfe1e6"></div>
        <div style="position:absolute;left:0;right:0;bottom:50%;border-top:1px dashed #dfe1e6"></div>
        <div style="position:absolute;left:0;right:0;bottom:75%;border-top:1px dashed #dfe1e6"></div>
        <div style="position:absolute;right:4px;bottom:22%;font-size:0.55rem;color:#5e6c84">1</div>
        <div style="position:absolute;right:4px;bottom:47%;font-size:0.55rem;color:#5e6c84">2</div>
        <div style="position:absolute;right:4px;bottom:72%;font-size:0.55rem;color:#5e6c84">3</div>
      </div>
    </div>
  </div>
</div>

## How to configure

### Where to find settings

1. Open **«Reports»** for your board and select the **«Control Chart»**.
2. In the chart options column, find the **«Grid»** checkbox and preset selector.

### How to configure

- **Enable the grid**: check the **«Grid»** checkbox.
- **Choose a preset**: select from **«Fibonacci»** (1,2,3,5; 1,2,3,5,8; 1,2,3,5,8,13) or **«Linear»** (2–10 steps).
- **Reposition**: drag the overlay to reposition it on the chart.
- **Resize**: use the resize handle (bottom-right corner) to adjust the overlay size.

The grid state is session-only and resets on page reload. This feature is not supported in Firefox.

## How to use

- Horizontal guide lines appear within the draggable overlay, labeled with story points (SP) and corresponding days.
- Each line represents a step in the selected sequence, helping you estimate how many days correspond to a given SP value.
- Drag the overlay to align grid lines with chart data points for visual estimation.
- Resize the overlay to fit different areas of the chart.
- Disable the grid by unchecking the checkbox.

## Usage scenarios

- **Story point calibration:** Align Fibonacci steps with the chart to calibrate team estimates against actual cycle time.
- **Quick estimation:** Use linear steps to estimate cycle time for tasks of varying sizes.
- **Presentation aid:** Use the grid during team discussions to visualize time distributions.
- **Process analysis:** Overlay different presets to find the best fit for the team's delivery patterns.

## Troubleshooting

- **Grid not appearing:** This feature is not supported in Firefox. In Chrome, ensure the checkbox is checked after the chart loads.
- **Grid lines misaligned:** Drag the overlay to reposition. The grid lines recalculate based on the overlay's position and size.
- **Preset not changing:** Select a different preset from the dropdown; the lines update immediately.
- **Resize handle not responding:** The resize handle is in the bottom-right corner of the overlay. Ensure the overlay is visible and drag the corner.

## See also

- [SLA Line](/docs/features/control-chart/sla-line)
