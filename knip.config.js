export default {
  entry: ['src/content.js', 'src/background/background.ts'],
  project: ['src/**/*.{js,ts}'],
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
