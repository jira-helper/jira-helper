# SLA Line

| | |
|---|---|
| Где настраивается | «Reports» → «Control Chart» → «SLA» input field in chart options |
| Где видно | Reports (Control Chart) |
| Settings apply to | For the whole team |(`slaConfig3`) |

## Purpose

Add a horizontal SLA reference line to the Control Chart report with a shaded percentile band and legend entry, helping teams assess how much work meets the SLA target.


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

## How to configure

### Where to find settings

1. Open **«Reports»** for your board and select the **«Control Chart»**.
2. In the chart options column, find the **«SLA»** input field.

### How to configure

- **Set SLA target**: enter a target value in **days**. The chart updates immediately, showing a green reference line and shaded band.

Click **«Save»** to persist the SLA value for everyone using this board. The value is stored as a Jira board property.

The SLA line can also be changed temporarily via the URL parameter `sla` without saving — useful for quick "what-if" analysis.

## How to use

- A green horizontal line appears at the SLA position on the chart.
- A translucent green band spans the percentile range of issues at or below the SLA.
- The line label shows two values: the SLA in days (e.g. `5d`) and the percentage of issues at or below that SLA (e.g. `85%`).
- An **«SLA»** entry is added to the chart legend for clarity.
- Changing the input value updates the chart live — use this to explore different SLA targets before committing.

## Usage scenarios

- **SLA compliance review:** Check what percentage of issues meet the team's SLA target.
- **What-if analysis:** Temporarily adjust SLA via the URL parameter to explore threshold effects without saving.
- **Process improvement:** Track how SLA compliance changes over time by revisiting the chart with a fixed SLA baseline.
- **Reporting:** Use the percentile data to report SLA adherence to stakeholders.

## Troubleshooting

- **SLA line not appearing:** Ensure the Control Chart has finished loading (all data points visible). The chart SVG must be fully rendered.
- **Save button disabled:** You may not have permission to edit the board. The SLA value can still be used temporarily.
- **Wrong percentile:** The percentile is calculated from visible chart data points. Ensure the chart shows the full dataset.
- **Input not responding:** Check for browser console errors. The SLA input is injected into the Jira chart options panel.

## See also

- [Scale Ruler](/docs/features/control-chart/scale-ruler)
