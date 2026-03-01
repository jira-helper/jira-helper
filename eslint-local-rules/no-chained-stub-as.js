/**
 * ESLint rule to prevent chaining .as() after .resolves(), .rejects(), .returns(), .callsFake()
 * on cy.stub() calls.
 *
 * BAD:  cy.stub().resolves().as('name')
 * GOOD: const stub = cy.stub().resolves(); cy.wrap(stub).as('name');
 */

const STUB_METHODS = ['resolves', 'rejects', 'returns', 'callsFake'];

const rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow chaining .as() after stub configuration methods',
      recommended: true,
    },
    messages: {
      noChainedStubAs: `Don't chain .as() after .{{method}}() on cy.stub().
Instead, use:
  const stub = cy.stub().{{method}}(...);
  cy.wrap(stub).as('{{alias}}');`,
    },
    schema: [],
  },

  create(context) {
    return {
      CallExpression(node) {
        // Check if this is a .as() call
        if (
          node.callee.type !== 'MemberExpression' ||
          node.callee.property.type !== 'Identifier' ||
          node.callee.property.name !== 'as'
        ) {
          return;
        }

        // Get the alias name for the error message
        const aliasArg = node.arguments[0];
        const alias = aliasArg && aliasArg.type === 'Literal' ? aliasArg.value : 'aliasName';

        // Check the object that .as() is called on
        const asObject = node.callee.object;

        // Check if it's a call expression (method call)
        if (asObject.type !== 'CallExpression') {
          return;
        }

        // Check if it's a member expression (e.g., something.resolves())
        if (
          asObject.callee.type !== 'MemberExpression' ||
          asObject.callee.property.type !== 'Identifier'
        ) {
          return;
        }

        const methodName = asObject.callee.property.name;

        // Check if it's one of the stub configuration methods
        if (!STUB_METHODS.includes(methodName)) {
          return;
        }

        // Now check if the chain starts with cy.stub()
        let current = asObject.callee.object;
        while (current) {
          if (current.type === 'CallExpression') {
            if (
              current.callee.type === 'MemberExpression' &&
              current.callee.object.type === 'Identifier' &&
              current.callee.object.name === 'cy' &&
              current.callee.property.type === 'Identifier' &&
              current.callee.property.name === 'stub'
            ) {
              // Found cy.stub() at the start of the chain
              context.report({
                node,
                messageId: 'noChainedStubAs',
                data: {
                  method: methodName,
                  alias: alias,
                },
              });
              return;
            }
            current = current.callee.object;
          } else if (current.type === 'MemberExpression') {
            current = current.object;
          } else {
            break;
          }
        }
      },
    };
  },
};

export default rule;
