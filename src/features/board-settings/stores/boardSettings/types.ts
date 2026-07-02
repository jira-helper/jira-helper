export type BoardSettingsState = {
  data: {
    settings: BoardSetting[];
  };
  actions: {
    addSetting: (setting: BoardSetting) => void;
  };
};

export type BoardSetting = {
  id: string;
  title: string;
  component: React.ComponentType;
};
