import Progress from 'antd/es/progress';
import Tooltip from 'antd/es/tooltip';
import React from 'react';
import { ColorScheme } from './types';

const SchemeChooser = (props: { scheme: ColorScheme; onSelect: (scheme: ColorScheme) => void }) => {
  const { scheme, onSelect } = props;
  <Tooltip title="3 done / 3 in progress / 4 to do">
    <Progress percent={60} success={{ percent: 30 }} />
  </Tooltip>;

  return <div>SchemeChooser</div>;
};

export const StatusMapper = () => {
  return <div>StatusMapper</div>;
};
