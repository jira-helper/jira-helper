export default {
  entry: ['src/content.ts', 'src/background/background.ts'],
  project: ['src/**/*.{js,jsx,ts,tsx}'],
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
