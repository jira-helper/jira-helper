/**
 * Forbids importing `useSnapshot` from 'valtio' outside of module.ts files.
 *
 * useSnapshot should only be used in module.ts where models are registered in DI.
 * Application code should use useModel() provided by the DI token.
 *
 * BAD (in any file except module.ts):
 *   import { useSnapshot } from 'valtio';
 *
 * GOOD (in module.ts):
 *   import { useSnapshot } from 'valtio';
 *   container.register({ token, value: { model, useModel: () => useSnapshot(model) } });
 *
 * GOOD (in containers):
 *   const { useModel } = useDi().inject(myModelToken);
 */

import path from 'path';

const rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct useSnapshot import outside module.ts',
      recommended: true,
    },
    messages: {
      noDirectSnapshot:
        'Direct import of useSnapshot from valtio is forbidden outside module.ts. Use useModel() from DI token instead.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename || context.getFilename();
    const basename = path.basename(filename);

    if (basename === 'module.ts') {
      return {};
    }

    return {
      ImportDeclaration(node) {
        if (node.source.value !== 'valtio') return;

        for (const specifier of node.specifiers) {
          if (
            specifier.type === 'ImportSpecifier' &&
            specifier.imported.name === 'useSnapshot'
          ) {
            context.report({
              node: specifier,
              messageId: 'noDirectSnapshot',
            });
          }
        }
      },
    };
  },
};

export default rule;
