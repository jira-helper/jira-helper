import React, { useMemo } from 'react';
import { Button, Select, Spin } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { JiraStatus } from 'src/infrastructure/jira/types';
import { PROGRESS_BUCKET_OPTIONS } from '../constants';
import type { ProgressBucket, StatusProgressMappingRow } from '../types';
import './StatusProgressMappingSection.css';

type StatusOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type StatusProgressMappingSectionProps = {
  title: string;
  description?: string;
  addButtonLabel: string;
  rows: StatusProgressMappingRow[];
  statuses: JiraStatus[];
  isLoadingStatuses: boolean;
  disabled?: boolean;
  onChange: (rows: StatusProgressMappingRow[]) => void;
  texts: {
    statusLabel: string;
    bucketLabel: string;
    selectStatusPlaceholder: string;
    selectBucketPlaceholder: string;
    removeRow: string;
    noStatusFound: string;
  };
};

function resolveStatusLabel(statusId: string, fallbackName: string, statusesById: ReadonlyMap<string, string>): string {
  return statusesById.get(statusId) ?? fallbackName;
}

function BucketLabel({ bucket, label }: { bucket: ProgressBucket; label: string }) {
  return (
    <span className="jh-status-progress-mapping-section__bucket-label">
      <span
        className={`jh-status-progress-mapping-section__bucket-marker jh-status-progress-mapping-section__bucket-marker--${bucket}`}
        aria-hidden="true"
      />
      <span>{label}</span>
    </span>
  );
}

export function StatusProgressMappingSection({
  title,
  description,
  addButtonLabel,
  rows,
  statuses,
  isLoadingStatuses,
  disabled = false,
  onChange,
  texts,
}: StatusProgressMappingSectionProps) {
  const statusesById = useMemo(() => new Map(statuses.map(status => [status.id, status.name])), [statuses]);
  const selectedIds = useMemo(() => new Set(rows.map(row => row.statusId).filter(Boolean)), [rows]);
  const bucketOptions = useMemo(
    () =>
      PROGRESS_BUCKET_OPTIONS.map(option => ({
        value: option.value,
        label: <BucketLabel bucket={option.value} label={option.label} />,
      })),
    []
  );

  const updateRow = (index: number, nextRow: StatusProgressMappingRow) => {
    onChange(rows.map((row, rowIndex) => (rowIndex === index ? nextRow : row)));
  };

  const removeRow = (index: number) => {
    onChange(rows.filter((_, rowIndex) => rowIndex !== index));
  };

  const buildStatusOptions = (row: StatusProgressMappingRow): StatusOption[] => {
    const options = statuses.map(status => ({
      value: status.id,
      label: status.name,
      disabled: status.id !== row.statusId && selectedIds.has(status.id),
    }));

    if (row.statusId && !statusesById.has(row.statusId)) {
      options.unshift({
        value: row.statusId,
        label: row.statusName,
        disabled: false,
      });
    }

    return options;
  };

  const selectFilterOption = (input: string, option?: StatusOption) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

  return (
    <section className="jh-status-progress-mapping-section">
      <div className="jh-status-progress-mapping-section__header">
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
      </div>

      <div className="jh-status-progress-mapping-section__rows">
        {rows.length > 0 ? (
          <div className="jh-status-progress-mapping-section__columns" aria-hidden="true">
            <span>{texts.statusLabel}</span>
            <span>{texts.bucketLabel}</span>
            <span />
          </div>
        ) : null}
        {rows.map((row, index) => {
          const statusOptions = buildStatusOptions(row);
          const statusLabel = resolveStatusLabel(row.statusId, row.statusName, statusesById);

          return (
            <div
              key={`${row.statusId || 'empty'}-${index}`}
              data-testid={`status-progress-mapping-row-${index}`}
              className="jh-status-progress-mapping-section__row"
            >
              <Select
                data-testid={`status-progress-mapping-status-${index}`}
                aria-label={texts.statusLabel}
                value={row.statusId || undefined}
                placeholder={texts.selectStatusPlaceholder}
                showSearch
                virtual={false}
                optionFilterProp="label"
                filterOption={selectFilterOption}
                loading={isLoadingStatuses}
                disabled={disabled}
                notFoundContent={isLoadingStatuses ? <Spin size="small" /> : texts.noStatusFound}
                options={statusOptions}
                className="jh-status-progress-mapping-section__status-select"
                onChange={(statusId, option) => {
                  const selected = Array.isArray(option) ? option[0] : option;
                  updateRow(index, {
                    ...row,
                    statusId,
                    statusName: typeof selected?.label === 'string' ? selected.label : statusLabel,
                  });
                }}
              />
              <Select
                data-testid={`status-progress-mapping-bucket-${index}`}
                aria-label={texts.bucketLabel}
                value={row.bucket}
                placeholder={texts.selectBucketPlaceholder}
                virtual={false}
                disabled={disabled}
                options={bucketOptions}
                className="jh-status-progress-mapping-section__bucket-select"
                onChange={(bucket: ProgressBucket) => updateRow(index, { ...row, bucket })}
              />
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                aria-label={texts.removeRow}
                title={texts.removeRow}
                disabled={disabled}
                onClick={() => removeRow(index)}
              />
            </div>
          );
        })}
      </div>

      <Button
        block
        type="dashed"
        className="jh-status-progress-mapping-section__add-button"
        disabled={disabled}
        onClick={() => onChange([...rows, { statusId: '', statusName: '', bucket: 'todo' }])}
      >
        {addButtonLabel}
      </Button>
    </section>
  );
}
