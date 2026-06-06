import type { Container } from 'dioma';
import { Ok, type Result } from 'ts-results';
import { diagnosticModelToken } from 'src/features/diagnostic-module/tokens';
import type { FeatureDiagnosticData } from 'src/features/diagnostic-module/types';

export const BUG_TEMPLATE_STORAGE_KEY = 'jira_helper_textarea_bug_template';

export function collectBugTemplateDiagnosticData(): Result<FeatureDiagnosticData, Error> {
  return Ok({
    settings: {
      boardProperty: null,
      localStorage: {
        bugTemplate: localStorage.getItem(BUG_TEMPLATE_STORAGE_KEY),
      },
    },
    runtime: null,
  });
}

export function registerBugTemplateDiagnosticData(container: Container): void {
  const { model: diagnosticModel } = container.inject(diagnosticModelToken);

  diagnosticModel.registerDiagnosticData('bug-template', collectBugTemplateDiagnosticData);
}
