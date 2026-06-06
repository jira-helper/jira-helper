# Автоматическая публикация в Chrome Web Store

Этот документ описывает настройку автоматической публикации расширения в Chrome Web Store через GitHub Actions.

## Настройка

### 1. Подготовка Service Account ключа

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте или выберите проект
3. Включите Chrome Web Store API
4. Создайте Service Account:
   - Перейдите в "IAM & Admin" → "Service Accounts"
   - Создайте новый Service Account
   - Создайте JSON ключ для этого аккаунта
5. В [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole):
   - Перейдите в настройки вашего расширения
   - В разделе "API access" добавьте Service Account (используйте email из JSON ключа)
   - Предоставьте необходимые права

### 2. Настройка GitHub Secrets

1. Перейдите в настройки репозитория: Settings → Secrets and variables → Actions
2. Добавьте новый secret с именем `CHROME_WEBSTORE_CREDENTIALS`
3. Значение должно быть JSON содержимым файла ключа Service Account (весь JSON объект)

Пример:
```json
{
  "type": "service_account",
  "project_id": "...",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

**Важно:** Весь JSON должен быть в одной строке или использовать многострочный формат secrets GitHub.

## Использование

### Автоматическая публикация

Workflow запускается автоматически при создании нового release в GitHub:

1. Создайте новый release в GitHub
2. Workflow автоматически:
   - Соберет расширение
   - Загрузит его в Chrome Web Store (draft)
   - Опубликует расширение

### Ручной запуск

Для ручного запуска публикации:

```bash
# Установите переменную окружения с credentials
export CHROME_WEBSTORE_CREDENTIALS='{"type":"service_account",...}'

# Или используйте файл
export CHROME_WEBSTORE_CREDENTIALS_FILE='./path/to/credentials.json'

# Запустите скрипт
node tools/publish-chrome-webstore.js
```

## Workflow файл

Workflow файл находится в `.github/workflows/publish-chrome.yml` и настроен на запуск при событии `release.published`.

## Скрипт публикации

Скрипт `tools/publish-chrome-webstore.js` выполняет следующие действия:

1. Авторизация через Google Auth Library
2. Загрузка ZIP файла расширения в Chrome Web Store
3. Публикация расширения

## Troubleshooting

### Ошибка авторизации

- Убедитесь, что Service Account добавлен в Chrome Web Store Developer Dashboard
- Проверьте, что JSON ключ корректен
- Убедитесь, что Chrome Web Store API включен в Google Cloud Console

### Ошибка загрузки

- Проверьте размер файла (максимум 200MB для Chrome Web Store)
- Убедитесь, что ZIP файл корректно собран
- Проверьте логи workflow для деталей ошибки

### Ошибка публикации

- Убедитесь, что расширение прошло все проверки Chrome Web Store
- Проверьте статус расширения в Developer Dashboard
- Некоторые ошибки могут потребовать ручного вмешательства через веб-интерфейс
