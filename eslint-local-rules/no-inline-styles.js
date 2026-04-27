const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow JSX inline style props; use CSS classes and modifiers instead.',
      recommended: true,
    },
    messages: {
      noInlineStyle:
        'Inline JSX style props are forbidden. Use a CSS class / modifier class instead. If this is legacy code, add an explicit eslint-disable with a reason.',
    },
    schema: [],
  },

  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name?.type !== 'JSXIdentifier' || node.name.name !== 'style') {
          return;
        }
        context.report({
          node,
          messageId: 'noInlineStyle',
        });
      },
    };
  },
};

export default rule;
