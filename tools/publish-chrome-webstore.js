/* eslint-disable no-console */
import { GoogleAuth } from 'google-auth-library';
import https from 'https';
import fs from 'fs';

const EXTENSION_ID = 'egmbomekcmpieccamghfgjgnlllgbgdl';

// Функция для выполнения HTTP запроса
function makeRequest(options, description, postData = null) {
  return new Promise((resolve, reject) => {
    console.log(`\n=== ${description} ===`);
    console.log(`URL: https://${options.hostname}${options.path}`);
    console.log(`Method: ${options.method}`);

    if (postData) {
      console.log(`Data size: ${postData.length} bytes (${(postData.length / 1024 / 1024).toFixed(2)} MB)`);
    }

    const req = https.request(options, res => {
      console.log('Status Code:', res.statusCode);

      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const jsonData = JSON.parse(data);
            console.log('✅ Успешно:', JSON.stringify(jsonData, null, 2));
            resolve(jsonData);
          } catch {
            console.log('📄 Ответ (не JSON):', data);
            resolve(data);
          }
        } else {
          console.log(`❌ Ошибка ${res.statusCode}:`, data);
          try {
            const errorData = JSON.parse(data);
            console.log('Детали ошибки:', JSON.stringify(errorData, null, 2));
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(errorData)}`));
          } catch {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        }
      });
    });

    req.on('error', e => {
      console.error('🔥 Ошибка запроса:', e);
      reject(e);
    });

    if (postData) {
      req.write(postData);
    }

    req.end();
  });
}

// Функция для загрузки файла расширения
async function uploadExtension(accessToken, zipFilePath) {
  console.log(`\n🚀 Начинаем загрузку файла: ${zipFilePath}`);

  if (!fs.existsSync(zipFilePath)) {
    throw new Error(`Файл не найден: ${zipFilePath}`);
  }

  const fileBuffer = fs.readFileSync(zipFilePath);
  console.log(`📦 Размер файла: ${fileBuffer.length} bytes (${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB)`);

  const options = {
    hostname: 'www.googleapis.com',
    path: `/upload/chromewebstore/v1.1/items/${EXTENSION_ID}`,
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/zip',
      'Content-Length': fileBuffer.length,
      'x-goog-api-version': '2',
    },
  };

  return await makeRequest(options, 'Загрузка нового файла расширения', fileBuffer);
}

async function publishExtension(accessToken) {
  console.log('\n🚀 Публикуем расширение');

  const options = {
    hostname: 'www.googleapis.com',
    path: `/chromewebstore/v1.1/items/${EXTENSION_ID}/publish`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  };

  return await makeRequest(options, 'Публикация расширения');
}

async function getExtensionStatus(accessToken) {
  const options = {
    hostname: 'www.googleapis.com',
    path: `/chromewebstore/v1.1/items/${EXTENSION_ID}?projection=DRAFT`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  };

  return await makeRequest(options, 'Получение статуса расширения');
}

async function main() {
  console.log('🚀 Скрипт публикации расширения jira-helper в Chrome Web Store');
  console.log('📅 Дата и время запуска:', new Date().toISOString());
  console.log('='.repeat(80));

  // Получаем credentials из переменной окружения или файла
  const credentialsJson = process.env.CHROME_WEBSTORE_CREDENTIALS;
  const credentialsFile = process.env.CHROME_WEBSTORE_CREDENTIALS_FILE;
  const zipFilePath = process.env.EXTENSION_ZIP_PATH || './jira-helper.zip';

  let credentials;
  if (credentialsJson) {
    console.log('🔐 Используем credentials из переменной окружения');
    credentials = JSON.parse(credentialsJson);
  } else if (fs.existsSync(credentialsFile)) {
    console.log(`🔐 Используем credentials из файла: ${credentialsFile}`);
    credentials = JSON.parse(fs.readFileSync(credentialsFile, 'utf8'));
  } else {
    throw new Error(
      'Credentials не найдены. Установите CHROME_WEBSTORE_CREDENTIALS или CHROME_WEBSTORE_CREDENTIALS_FILE'
    );
  }

  console.log(`🆔 ID расширения: ${EXTENSION_ID}`);
  console.log(`📦 Файл расширения: ${zipFilePath}`);

  const scopes = ['https://www.googleapis.com/auth/chromewebstore'];

  try {
    // Авторизация
    console.log('\n🔑 Выполняем авторизацию...');
    const auth = new GoogleAuth({
      credentials,
      scopes,
    });

    const client = await auth.getClient();
    const accessTokenResponse = await client.getAccessToken();
    const accessToken = accessTokenResponse.token;

    if (!accessToken) {
      throw new Error('Не удалось получить access token');
    }

    console.log('✅ Токен получен успешно');

    // Шаг 1: Загружаем расширение
    console.log('\n📤 Шаг 1: Загружаем расширение в Chrome Web Store');
    const uploadResult = await uploadExtension(accessToken, zipFilePath);

    if (uploadResult.error) {
      throw new Error(`Ошибка загрузки: ${uploadResult.error}`);
    }

    console.log('✅ Расширение успешно загружено');

    // Шаг 2: Проверяем статус после загрузки
    console.log('\n📋 Шаг 2: Проверяем статус после загрузки');
    const afterUploadInfo = await getExtensionStatus(accessToken);
    console.log(`📊 Версия: ${afterUploadInfo.crxVersion}`);
    console.log(`📊 Статус загрузки: ${afterUploadInfo.uploadState}`);

    // Шаг 3: Публикуем расширение
    console.log('\n🚀 Шаг 3: Публикуем расширение');
    const publishResult = await publishExtension(accessToken);

    if (publishResult.error) {
      throw new Error(`Ошибка публикации: ${publishResult.error}`);
    }

    console.log('✅ Расширение успешно отправлено на публикацию!');
    console.log(`📊 Статус публикации: ${JSON.stringify(publishResult.status || publishResult, null, 2)}`);

    // Шаг 4: Финальная проверка
    console.log('\n🏁 Шаг 4: Финальная проверка статуса');
    const finalInfo = await getExtensionStatus(accessToken);
    console.log(`📊 Итоговая версия: ${finalInfo.crxVersion}`);
    console.log(`📊 Итоговый статус: ${finalInfo.uploadState}`);

    console.log('\n🎉 ПРОЦЕСС ЗАВЕРШЕН УСПЕШНО!');
    console.log('📊 Итоговая информация:');
    console.log(`   - ID расширения: ${EXTENSION_ID}`);
    console.log(`   - Версия: ${finalInfo.crxVersion || 'N/A'}`);
    console.log(`   - Статус: ${finalInfo.uploadState || 'N/A'}`);
  } catch (error) {
    console.error('\n❌ ОШИБКА:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
