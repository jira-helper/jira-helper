function isFeaturePath(importPath) {
  return importPath.startsWith('src/features/');
}

function getFeatureFromImportPath(importPath) {
  const match = importPath.match(/^src\/features\/([^/]+)\//);
  return match ? match[1] : null;
}

function getCurrentFeature(filename) {
  const normalized = filename.replace(/\\/g, '/');
  const match = normalized.match(/\/src\/features\/([^/]+)\//);
  return match ? match[1] : null;
}

function isAllowedCrossFeatureImport(importPath, importKind) {
  if (importPath.includes('/tokens')) return true;
  if (typeof importKind !== 'string' || importKind !== 'type') {
    return false;
  }
  return importPath.includes('/types');
}

function hasTypeOnlySpecifiers(node) {
  return node.specifiers.every(specifier => {
    if (specifier.type === 'ImportSpecifier') {
      return specifier.importKind === 'type';
    }
    return specifier.type === 'ImportDefaultSpecifier' || specifier.type === 'ImportNamespaceSpecifier' ? false : true;
  });
}

const rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Restrict imports inside module.ts to same feature, own code, and cross-feature tokens/types contracts.',
      recommended: true,
    },
    messages: {
      noCrossFeatureModuleImport:
        'Cross-feature import from "{{importSource}}" is forbidden in module.ts. Import tokens only (or type imports from types), and keep runtime coupling via DI contracts.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename?.() || '';
    if (filename === '<input>' || filename === '<text>') {
      return {};
    }

    const currentFeature = getCurrentFeature(filename);
    if (!currentFeature) {
      return {};
    }

    const isThisModuleFile = /[\\/]module\.ts$/.test(filename.replace(/\\/g, '/'));
    if (!isThisModuleFile) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (typeof source !== 'string') return;
        if (!isFeaturePath(source)) return;

        const importedFeature = getFeatureFromImportPath(source);
        if (!importedFeature || importedFeature === currentFeature) {
          return;
        }

        const canCrossImport =
          isAllowedCrossFeatureImport(source, node.importKind) || (node.importKind === 'type' && hasTypeOnlySpecifiers(node));

        if (!canCrossImport) {
          context.report({
            node,
            messageId: 'noCrossFeatureModuleImport',
            data: {
              importSource: source,
            },
          });
        }
      },
    };
  },
};

export default rule;
