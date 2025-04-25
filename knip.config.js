export default {
  entry: ['src/content.js', 'src/background/background.ts'],
  project: ['src/**/*.{jsx?,tsx?}'],
  rules: {
    files: 'error',
    classMembers: 'error',
    duplicates: 'error',
    dependencies: 'error',
    unlisted: 'error',
    exports: 'error',
    types: 'error',
  },
};
