import React from 'react';
import { extensionApiService } from '../ExtensionApiService';

interface ImageProps {
  src: string;
  width?: number;
  height?: number;
}

export const Image: React.FC<ImageProps> = ({ src, width, height }) => {
  const isInStorybook = document.getElementById('storybook-root');
  const url = isInStorybook ? src : extensionApiService.getUrl(src);

  return <img src={url} width={width} height={height} />;
};
