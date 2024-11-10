<script lang="ts">
  export let src: string;
  export let width: number | undefined = undefined;

  const url = chrome.runtime.getURL(src);
</script>

<img src={url} {width} />
