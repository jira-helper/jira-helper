export const mergeSwimlaneSettings = ([settings, oldLimits]: [Record<string, any>, Record<string, any>]) => {
  if (settings) return settings;

  const convertedSettings = {};

  if (oldLimits) {
    Object.keys(oldLimits).forEach(swimlaneId => {
      // @ts-expect-error any index
      convertedSettings[swimlaneId] = {
        limit: oldLimits[swimlaneId],
      };
    });
  }

  return convertedSettings;
};
