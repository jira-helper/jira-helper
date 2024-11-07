import s from './styles.module.css';

type FieldLimitsTemplateProps = {
  listBody: string;
};

type FieldLimitBlockTemplateProps = {
  blockClass: string;
  dataFieldLimitKey: string;
  innerText: string;
  bkgColor?: string;
  issuesCountClass: string;
};

type FieldLimitTitleTemplateProps = {
  limit?: number;
  current?: number;
  fieldName: string;
  fieldValue: string;
};

// Template for rendering the field limits list container
export const fieldLimitsTemplate = ({ listBody }: FieldLimitsTemplateProps): string =>
  `<div class="${s.fieldLimitsList}">${listBody}</div>`;

// Template for rendering an individual field limit block
export const fieldLimitBlockTemplate = ({
  blockClass,
  dataFieldLimitKey,
  innerText,
  bkgColor,
  issuesCountClass,
}: FieldLimitBlockTemplateProps): string => `
                          <div class="${blockClass} ${s.fieldLimitsItem}"
                          style="background-color:${bkgColor || 'none'}"
                          data-field-limit-key="${dataFieldLimitKey}">
                              <div><span>${innerText}</span></div>
                              <div class="${s.limitStats} ${issuesCountClass}"></div>
                          </div>`;

// Template for rendering field limit title
export const fieldLimitTitleTemplate = ({
  limit = 0,
  current = 0,
  fieldName,
  fieldValue,
}: FieldLimitTitleTemplateProps): string =>
  `current: ${current} \nlimit: ${limit} \nfield name: ${fieldName}\nfield value: ${fieldValue}`;
