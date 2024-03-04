export const mergeSwimlaneSettings = ([settings, oldLimits]) => {
  if (settings) return settings;

  if (typeof settings === 'undefined' && typeof oldLimits === 'undefined') {
    return {};
  }

  const convertedSettings = {};

  if (oldLimits) {
    Object.keys(oldLimits).forEach(swimlaneId => {
      convertedSettings[swimlaneId] = {
        limit: oldLimits[swimlaneId],
      };
    });
  }

  return convertedSettings;
};
