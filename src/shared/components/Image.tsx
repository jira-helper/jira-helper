import React from 'react';

interface ImageProps {
  src: string;
  width?: number;
}

export const Image: React.FC<ImageProps> = ({ src, width }) => {
  const isInStorybook = document.getElementById('storybook-root')
  const url = isInStorybook ? src : chrome.runtime.getURL(src);

  return <img src={url} width={width} />;
};
