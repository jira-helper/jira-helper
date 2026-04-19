import React from 'react';
import { extensionApiServiceToken } from 'src/infrastructure/extension-api/ExtensionApiService';
import { useDi } from 'src/infrastructure/di/diContext';

interface ImageProps {
  src: string;
  width?: number;
  height?: number;
}

export const Image: React.FC<ImageProps> = ({ src, width, height }) => {
  const extensionApi = useDi().inject(extensionApiServiceToken);
  const isInStorybook = document.getElementById('storybook-root');
  const url = isInStorybook ? src : extensionApi.getUrl(src);

  return <img src={url} width={width} height={height} />;
};
