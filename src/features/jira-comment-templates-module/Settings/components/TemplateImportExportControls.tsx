import React from 'react';
import { Alert, Button, Space, Upload } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';

import styles from './jira-comment-templates-settings.module.css';

export type TemplateImportExportControlsLabels = {
  importFile: string;
  exportTemplates: string;
  importing: string;
  importError: string;
};

export type TemplateImportExportControlsProps = {
  isImporting: boolean;
  isDisabled?: boolean;
  importError: string | null;
  labels: TemplateImportExportControlsLabels;
  onImportFileSelected: (file: File) => void;
  onExport: () => void;
};

export const TemplateImportExportControls: React.FC<TemplateImportExportControlsProps> = ({
  isImporting,
  isDisabled = false,
  importError,
  labels,
  onImportFileSelected,
  onExport,
}) => {
  const disabled = isDisabled || isImporting;

  return (
    <section className={styles.importExport} aria-label={`${labels.importFile} / ${labels.exportTemplates}`}>
      <Space wrap>
        <Upload
          accept="application/json,.json"
          disabled={disabled}
          showUploadList={false}
          beforeUpload={file => {
            onImportFileSelected(file as File);
            return false;
          }}
        >
          <Button
            icon={<UploadOutlined aria-hidden />}
            disabled={disabled}
            loading={isImporting}
            aria-label={isImporting ? labels.importing : labels.importFile}
          >
            {isImporting ? labels.importing : labels.importFile}
          </Button>
        </Upload>
        <Button
          icon={<DownloadOutlined aria-hidden />}
          disabled={disabled}
          aria-label={labels.exportTemplates}
          onClick={onExport}
        >
          {labels.exportTemplates}
        </Button>
      </Space>
      {importError && (
        <Alert
          role="alert"
          type="error"
          showIcon
          className={styles.globalError}
          message={
            <>
              <strong>{labels.importError}</strong>: {importError}
            </>
          }
        />
      )}
    </section>
  );
};
