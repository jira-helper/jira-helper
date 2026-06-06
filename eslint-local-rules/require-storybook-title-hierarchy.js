function kebabToPascalCase(str) {
  if (/^[A-Z]/.test(str) && !str.includes('-')) return str;

  return str
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function deriveExpectedTitle(filepath) {
  const srcIndex = filepath.indexOf('/src/');
  if (srcIndex === -1) return null;

  const relativePath = filepath.slice(srcIndex + 5);
  const segments = relativePath.split('/');

  const filename = segments.pop();
  const componentName = filename
    .replace(/\.stories\.(tsx|ts)$/, '')
    .replace(/^([a-z])/, (_, c) => c.toUpperCase());

  const SKIP_DIRS = new Set(['features', 'components']);
  const filteredDirs = segments.filter(s => !SKIP_DIRS.has(s));

  if (
    filteredDirs.length > 0 &&
    filteredDirs[filteredDirs.length - 1].toLowerCase() === componentName.toLowerCase()
  ) {
    filteredDirs.pop();
  }

  const pascalDirs = filteredDirs.map(kebabToPascalCase);
  const titleSegments = [...pascalDirs, componentName];

  if (titleSegments.length < 2) return null;

  return titleSegments.join('/');
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce Storybook meta title hierarchy matching file path from src/',
    },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.getFilename?.();

    if (!filename.endsWith('.stories.tsx') && !filename.endsWith('.stories.ts')) {
      return {};
    }

    return {
      VariableDeclarator(node) {
        if (node.id?.name !== 'meta') return;

        let objectExpr = node.init;
        if (objectExpr?.type === 'TSSatisfiesExpression' || objectExpr?.type === 'TSAsExpression') {
          objectExpr = objectExpr.expression;
        }
        if (objectExpr?.type !== 'ObjectExpression') return;

        const titleProp = objectExpr.properties.find(
          p => p.type === 'Property' && p.key?.name === 'title' && p.value?.type === 'Literal',
        );

        if (!titleProp) return;

        const currentTitle = titleProp.value.value;
        const expectedTitle = deriveExpectedTitle(filename);

        if (!expectedTitle) return;

        if (currentTitle !== expectedTitle) {
          context.report({
            node: titleProp.value,
            message: `Storybook title should match file path. Expected '${expectedTitle}'.`,
            fix(fixer) {
              return fixer.replaceText(titleProp.value, `'${expectedTitle}'`);
            },
          });
        }
      },
    };
  },
};
