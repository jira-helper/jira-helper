<script lang="ts">
  import { Checkbox, Theme, Tooltip } from 'carbon-components-svelte';
  import beforeImg from '../assets/card-colors-before.jpg';
  const url = chrome.runtime.getURL(beforeImg);
  let count = $state(0);
  setInterval(() => {
    count++;
  }, 1000);
</script>

<Theme
  tokens={{
    'interactive-01': '#d02670',
    'hover-primary': '#ee5396',
    'active-primary': '#9f1853',
    'icon-01': '#0052cc',
  }}
/>

<Checkbox labelText="Fill whole cards" checked />
<Tooltip>
  <p>Feature makes that whole card is colored, instead of just line on left side</p>
  <div>
    Before
    <img src={url} />
    After
    <img src="assets/card-colors-after.jpg" />
  </div>
</Tooltip>
