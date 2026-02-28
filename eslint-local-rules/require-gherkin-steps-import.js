module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require gherkin-steps import in .feature.cy.tsx files',
    },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    const filename = context.getFilename();

    if (!filename.endsWith('.feature.cy.tsx')) {
      return {};
    }

    let hasGherkinStepsImport = false;
    let lastImportNode = null;

    return {
      ImportDeclaration(node) {
        lastImportNode = node;
        if (node.source.value.includes('gherkin-steps/common')) {
          hasGherkinStepsImport = true;
        }
      },
      'Program:exit': function (node) {
        if (!hasGherkinStepsImport) {
          context.report({
            node,
            message: 'Missing gherkin-steps/common import in feature test file',
            fix(fixer) {
              const importStatement = "import 'cypress/support/gherkin-steps/common';\n";
              if (lastImportNode) {
                return fixer.insertTextAfter(lastImportNode, `\n${importStatement}`);
              }
              return fixer.insertTextBefore(node.body[0], importStatement);
            },
          });
        }
      },
    };
  },
};
