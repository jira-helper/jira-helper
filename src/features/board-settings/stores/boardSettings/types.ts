export type BoardSettingsState = {
  data: {
    settings: BoardSetting[];
  };
  actions: {
    addSetting: (setting: BoardSetting) => void;
  };
};

export type BoardSetting = {
  title: string;
  component: React.ComponentType<any>;
};
