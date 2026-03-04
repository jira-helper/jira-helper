# TASK-136: Создать LocaleProvider через DI

**Status**: DONE  
**Epic**: [EPIC-13](./EPIC-13-i18n-di-localization.md)  
**Phase**: 1 - Infrastructure

---

## Цель

Создать инфраструктуру для инжекции локали через DI.

---

## Что создать

### 1. Интерфейс ILocaleProvider

```typescript
// src/shared/locale/ILocaleProvider.ts
export interface ILocaleProvider {
  /** Получить локаль из Jira DOM (meta tag) */
  getJiraLocale(): string | null;
}
```

### 2. Токен

```typescript
// src/shared/locale/localeProviderToken.ts
import { Token } from 'dioma';
import type { ILocaleProvider } from './ILocaleProvider';

export const localeProviderToken = new Token<ILocaleProvider>('localeProvider');
```

### 3. Production реализация

```typescript
// src/shared/locale/JiraLocaleProvider.ts
import type { ILocaleProvider } from './ILocaleProvider';

export class JiraLocaleProvider implements ILocaleProvider {
  getJiraLocale(): string | null {
    return document.querySelector('meta[name="ajs-user-locale"]')?.getAttribute('content') ?? null;
  }
}
```

### 4. Mock реализация для тестов

```typescript
// src/shared/locale/MockLocaleProvider.ts
import type { ILocaleProvider } from './ILocaleProvider';

export class MockLocaleProvider implements ILocaleProvider {
  constructor(private locale: string | null = 'en') {}
  
  getJiraLocale(): string | null {
    return this.locale;
  }
  
  setLocale(locale: string | null): void {
    this.locale = locale;
  }
}
```

### 5. Index export

```typescript
// src/shared/locale/index.ts
export { type ILocaleProvider } from './ILocaleProvider';
export { localeProviderToken } from './localeProviderToken';
export { JiraLocaleProvider } from './JiraLocaleProvider';
export { MockLocaleProvider } from './MockLocaleProvider';
```

---

## Файловая структура

```
src/shared/locale/
├── ILocaleProvider.ts
├── localeProviderToken.ts
├── JiraLocaleProvider.ts
├── MockLocaleProvider.ts
└── index.ts
```

---

## Acceptance Criteria

- [ ] Создана папка `src/shared/locale/`
- [ ] Создан интерфейс `ILocaleProvider`
- [ ] Создан токен `localeProviderToken`
- [ ] Создана `JiraLocaleProvider` реализация
- [ ] Создана `MockLocaleProvider` реализация
- [ ] Экспорты через `index.ts`
- [ ] ESLint без ошибок

---

## Результаты

**Дата**: 2026-03-04

**Агент**: Coder

**Статус**: DONE

**Что сделано**:
- Создана папка `src/shared/locale/` с полной инфраструктурой
- `ILocaleProvider.ts` — интерфейс для провайдера локали
- `localeProviderToken.ts` — DI токен с JSDoc примерами использования
- `JiraLocaleProvider.ts` — production реализация (чтение из meta[name="ajs-user-locale"])
- `MockLocaleProvider.ts` — mock для тестов с методом `setLocale()`
- `index.ts` — экспорты
- ESLint и TypeScript проверки пройдены
