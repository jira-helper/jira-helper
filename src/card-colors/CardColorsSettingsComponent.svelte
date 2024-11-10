<script lang="ts">
  import Checkbox from '../shared/components/Checkbox.svelte';
  import beforeImg from '../assets/card-colors-before.jpg';
  import afterImg from '../assets/card-colors-after.jpg';
  import TooltipWithContent from '../shared/components/TooltipWithContent.svelte';
  import Image from '../shared/components/Image.svelte';

  let count = $state(0);
  setInterval(() => {
    count++;
  }, 1000);
</script>

<div class="jh-flex jh-justify-start">
  <Checkbox label="fill whole card" />
  <TooltipWithContent
    ><p>Feature makes that whole card is colored, instead of just line on left side</p>
    <div class="jh-flex jh-flex-row jh-gap-8">
      <span
        >Before
        <Image src={beforeImg} />
      </span>
      <span
        >After
        <Image src={afterImg} />
      </span>
    </div>
  </TooltipWithContent>
</div>
