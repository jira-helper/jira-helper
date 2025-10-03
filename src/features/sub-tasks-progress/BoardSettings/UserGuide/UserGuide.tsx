import React, { useState } from 'react';
import { Collapse, Steps, Typography, Card } from 'antd';
import { InfoCircleOutlined, CheckCircleOutlined, RocketOutlined } from '@ant-design/icons';
import { useGetTextsByLocale } from 'src/shared/texts';
import confetti from 'canvas-confetti';
import styles from './UserGuide.module.css';
import { TEXTS as ColumnSettingsTEXTS } from '../ColumnSettings/ColumnSettings';

const { Panel } = Collapse;
const { Title, Paragraph, Text } = Typography;

const TEXTS = {
  title: {
    en: 'How to use Sub-tasks Progress',
    ru: 'Как использовать прогресс подзадач',
  },
  subtitle: {
    en: 'Step-by-step guide to configure and use the feature',
    ru: 'Пошаговое руководство по настройке и использованию функции',
  },
  step1Title: {
    en: 'Configure Columns',
    ru: 'Настройте колонки',
  },
  step1Description: {
    en: 'Select which columns should be included in progress tracking. Fewer columns = less performance impact on jira server.',
    ru: 'Выберите, какие колонки должны отслеживаться. Меньше колонок = меньше нагрузка на jira server.',
  },
  step1Details: {
    en: `Go to "${ColumnSettingsTEXTS.columnsSettingsTitle.en}" section\nChoose only the columns you need for tracking\nAvoid selecting all columns to improve performance\nConsider your team's workflow when selecting columns`,
    ru: `Перейдите в раздел "${ColumnSettingsTEXTS.columnsSettingsTitle.ru}"\nВыберите только те колонки, где необходимо отслеживать прогресс под-задач\nИзбегайте выбора всех колонок - это уменьшит нагрузку на ваш jira server\nУчитывайте рабочий процесс вашей команды при выборе колонок`,
  },
  step2Title: {
    en: 'Configure Progress Calculation',
    ru: 'Настройте подсчет прогресса',
  },
  step2Description: {
    en: 'Set up, which subtasks should be counted as a progress.',
    ru: 'Настройте, по каким под-задачам должен рассчитываться прогресс',
  },
  step2Details: {
    en: 'Choose what to count as a sub-task, the progress of which should be displayed on the parent task card\nThe hierarchy of tasks in Jira looks like this: Epics contain tasks, tasks contain subtasks\nFor epics, this can be epic tasks, linked tasks and external links\nFor tasks, this can be subtasks, linked tasks and external links\nFor subtasks, this can be linked tasks and external links',
    ru: 'Выберите, что считать под-задачей, прогресс которой следует отображать на карточке родительской задачи\nИерархия задач в Jira выглядит так: Эпики содержат задачи, задачи содержат под-задачи\nДля эпиков это могут быть задачи эпика, прилинкованные задачи и внешние ссылки\nДля задач это могут быть подзадачи, прилинкованные задачи и внешние ссылки\nДля подзадач это могут быть прилинкованные задачи и внешние ссылки',
  },
  step3Title: {
    en: 'Configure Task Grouping',
    ru: 'Детально настройте группировку задач для отображения прогресса',
  },
  step3Description: {
    en: 'You can track the progress of all tasks, group tasks by field and track the progress of groups separately or create your own groups',
    ru: 'Вы можете отслеживать прогресс всех задач, группировать задачи по полю и отслеживать прогресс групп отдельно или сделать свои группы',
  },
  step3Details: {
    en: 'To track all tasks, select tracking all tasks. Now on the task cards in the columns from step 1, the progress of all tasks will be displayed\nTo create task groups, select grouping by field (project, assignee, etc.), when you do this - on the task cards there will be several progress indicators\nIf you need more precise settings for task groups for tracking - create your own groups using field matching or JQL',
    ru: 'Чтобы отслеживать все задачи выберите отслеживание всех задач. Теперь на карточках задачах в колонках из пункта 1 будет отображаться прогресс всех задач\nЧтобы создать группы задач выберите группировку по полю (проект, исполнитель и т.д.), когда вы это сделаете - на карточках задач будет несколько индикаторов прогресса\nЕсли вам нужны более точные настройки группы задач для отслеживания - создавайте свои группы с помощью матчинга по полям или по JQL',
  },
  step4Title: {
    en: 'Configure Progress Display',
    ru: 'Настройте вид отображения групп',
  },
  step4Description: {
    en: 'You can display the progress as a progress bar or a counter badge',
    ru: 'Прогресс можно отображать как прогресс-бар и бейджи-счетчики',
  },
  step4Details: {
    en: 'If you need to see how many tasks are done, how many are in progress, and how many are not in progress - use progress bars\nIf you need to see how many tasks are there and how many are done - use counters\nIf you need to see how many tasks are not completed - use counters with the option to show only incomplete tasks, this can be useful, for example, for displaying unclosed bugs\nIf you need to see the whole progress, but not to see it when all tasks are completed - enable hiding the group if all tasks in it are completed',
    ru: 'Если вам важно видеть, сколько задач из группы выполнено, сколько делается, а сколько еще не в работе - используйте прогресс-бар\nЕсли вам важно видеть, сколько всего задач и сколько из них выполнено - включите счетчики\nЕсли вам важно видеть, сколько есть незавершенных задач - включите счетчики с опцией показа только незавершенных задач, это может быть полезно, например, для отображения незакрытых багов\nЕсли вам нужно видеть весь прогресс, но не нужно его видеть когда все завершено - включите скрытие группы если все задачи в ней завершены',
  },
  step5Title: {
    ru: '🎉 Поздравляем! Вы успешно настроили отображение прогресс под-задач',
    en: '🎉 Congratulations! You have successfully configured the display of sub-task progress',
  },
  step5Description: {
    ru: 'Теперь вы можете видеть прогресс под-задач на доске, не проваливаясь в карточку задачи',
    en: 'Now you can see the progress of sub-tasks on the board, without going to the task card',
  },
  step5Details: {
    ru: 'Пробуйте разные опции настройки и отображения функционала, чтобы найти наиболее удобный для вас вариант',
    en: 'Try different settings and display options to find the most convenient for you option',
  },
  benefitsTitle: {
    en: 'Why use this feature?',
    ru: 'Зачем использовать эту функцию?',
  },
  benefitsItems: {
    en: '📊 Visual progress tracking for better project visibility\n⚡ Improved team productivity and task management\n🎯 Focus on incomplete tasks to avoid bottlenecks\n📈 Better sprint planning and resource allocation\n🔍 Quick identification of blocked or delayed tasks',
    ru: '📊 Визуальное отслеживание прогресса для лучшей видимости проекта\n⚡ Повышение продуктивности команды и управления задачами\n🎯 Фокус на незавершенных задачах для избежания узких мест\n📈 Лучшее планирование спринтов и распределение ресурсов\n🔍 Быстрое выявление заблокированных или задержанных задач',
  },
  tipsTitle: {
    en: 'Pro Tips',
    ru: 'Полезные советы',
  },
  tipsItems: {
    en: 'Start with basic settings and gradually add complexity\nFor simple cases, it will be enough to configure the progress of all subtasks or grouping by field',
    ru: 'Начните с базовых настроек и постепенно добавляйте сложность\nДля простых кейсов будет достаточно настроить прогресс всех под-задач или группировку по полю\n',
  },
};

const runConfetti = () => {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
  };

  function fire(particleRatio: number, opts: any) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
      zIndex: 99999,
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};

export const UserGuide = () => {
  const texts = useGetTextsByLocale(TEXTS);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: texts.step1Title,
      description: texts.step1Description,
      details: texts.step1Details,
      icon: <CheckCircleOutlined />,
    },
    {
      title: texts.step2Title,
      description: texts.step2Description,
      details: texts.step2Details,
      icon: <CheckCircleOutlined />,
    },
    {
      title: texts.step3Title,
      description: texts.step3Description,
      details: texts.step3Details,
      icon: <CheckCircleOutlined />,
    },
    {
      title: texts.step4Title,
      description: texts.step4Description,
      details: texts.step4Details,
      icon: <CheckCircleOutlined />,
    },
    {
      title: texts.step5Title,
      description: texts.step5Description,
      details: texts.step5Details,
      icon: <CheckCircleOutlined />,
    },
  ];
  const handleStepChange = (currentStep: number) => {
    setActiveStep(currentStep);
    const isLast = currentStep === steps.length - 1;
    if (!isLast) {
      return;
    }

    runConfetti();
  };

  return (
    <Card
      style={{ marginBottom: '24px' }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <InfoCircleOutlined style={{ color: '#1677ff' }} />
          <span>{texts.title}</span>
        </div>
      }
    >
      <Paragraph style={{ marginBottom: '24px', color: '#666' }}>{texts.subtitle}</Paragraph>

      <Steps
        current={activeStep}
        onChange={handleStepChange}
        direction="vertical"
        size="small"
        style={{ marginBottom: '24px' }}
        className={styles.stepsContainer}
        items={steps.map((step, index) => ({
          title: step.title,
          description: step.description,
          icon: step.icon,
          status: index <= activeStep ? 'finish' : 'wait',
        }))}
      />

      {activeStep < steps.length && (
        <Card size="small" style={{ marginBottom: '16px', backgroundColor: '#f6ffed' }}>
          <Title level={5} style={{ marginBottom: '12px' }}>
            {steps[activeStep].title}
          </Title>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {steps[activeStep].details.split('\n').map((detail: string) => (
              <li key={detail} style={{ marginBottom: '4px' }}>
                <Text>{detail}</Text>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Collapse ghost>
        <Panel
          header={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RocketOutlined style={{ color: '#52c41a' }} />
              <span>{texts.benefitsTitle}</span>
            </div>
          }
          key="benefits"
        >
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {texts.benefitsItems.split('\n').map((item: string) => (
              <li key={item} style={{ marginBottom: '8px' }}>
                <Text>{item}</Text>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          header={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <InfoCircleOutlined style={{ color: '#faad14' }} />
              <span>{texts.tipsTitle}</span>
            </div>
          }
          key="tips"
        >
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {texts.tipsItems.split('\n').map((tip: string) => (
              <li key={tip} style={{ marginBottom: '8px' }}>
                <Text>{tip}</Text>
              </li>
            ))}
          </ul>
        </Panel>
      </Collapse>
    </Card>
  );
};
