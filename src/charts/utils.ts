interface Tick {
  position: number;
  value: number;
}

// Gets chart ticks based on specific conditions
export const getChartTicks = (chartElement: Element): Tick[] => {
  const ticks = Array.from(chartElement.querySelectorAll('.tick')).filter(
    // @ts-expect-error
    elem => elem.lastChild?.attributes.y.value === '0' && elem.lastChild.textContent
  );

  return ticks.map(elem => {
    const [, transform] = elem.attributes.getNamedItem('transform')?.value.split(',') || ['', ''];
    return {
      position: Number(transform.slice(0, -1)),
      value: Number(elem.lastChild?.textContent),
    };
  });
};

// Calculates chart line position based on ticks and a given value
export const getChartLinePosition = (ticksVals: Tick[], value: number): number => {
  let nextTick = ticksVals[ticksVals.length - 1];
  for (let i = 0; i < ticksVals.length; i++) {
    if (ticksVals[i].value >= value) {
      nextTick = ticksVals[i];
      break;
    }
  }

  const maxTickValue = ticksVals[ticksVals.length - 1].value;

  if (maxTickValue >= 30) {
    const firstTick = ticksVals[0];

    if (!firstTick || !nextTick) return 0;

    return (
      firstTick.position - value ** (1 / 3) * ((firstTick.position - nextTick.position) / nextTick.value ** (1 / 3))
    );
  }

  let prevTick = ticksVals[0];
  for (let i = ticksVals.length - 1; i >= 0; i--) {
    if (ticksVals[i].value <= value) {
      prevTick = ticksVals[i];
      break;
    }
  }

  if (!prevTick || !nextTick) return 0;

  const percentDistance =
    nextTick.value === prevTick.value ? 0 : (value - prevTick.value) / (nextTick.value - prevTick.value);
  return prevTick.position - percentDistance * (prevTick.position - nextTick.position);
};

// Calculates chart value by given position
export const getChartValueByPosition = (ticksVals: Tick[], position: number): number => {
  let nextTick = ticksVals[ticksVals.length - 1];
  for (let i = 0; i < ticksVals.length; i++) {
    if (ticksVals[i].position <= position) {
      nextTick = ticksVals[i];
      break;
    }
  }

  const maxTickValue = ticksVals[ticksVals.length - 1].value;

  if (maxTickValue >= 30) {
    const firstTick = ticksVals[0];

    if (!firstTick || !nextTick) return 0;

    return (
      ((firstTick.position - position) / ((firstTick.position - nextTick.position) / nextTick.value ** (1 / 3))) ** 3
    );
  }

  let prevTick = ticksVals[0];
  for (let i = ticksVals.length - 1; i >= 0; i--) {
    if (ticksVals[i].position >= position) {
      prevTick = ticksVals[i];
      break;
    }
  }

  const percentDistance =
    nextTick.position === prevTick.position
      ? 0
      : (prevTick.position - position) / (prevTick.position - nextTick.position);
  return prevTick.value + percentDistance * (nextTick.value - prevTick.value);
};
