const fs = require('node:fs');
const path = require('node:path');

const targetBrowser = process.env.BROWSER === 'FIREFOX' ? 'firefox' : 'chrome';
const outputDir = targetBrowser === 'firefox' ? 'dist-firefox' : 'dist';
const manifestPath = path.resolve(__dirname, `../${outputDir}/manifest.json`);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

function fixCSPChrome130(manifestContent) {
  // See https://github.com/crxjs/chrome-extension-tools/issues/918

  const webAccessibleResources = manifestContent.web_accessible_resources;

  const updatedWebAccessibleResources = webAccessibleResources.map(resource => {
    if (resource.use_dynamic_url) {
      return {
        ...resource,
        use_dynamic_url: false,
      };
    }
    return resource;
  });

  manifestContent.web_accessible_resources = updatedWebAccessibleResources;
}

if (targetBrowser === 'chrome') {
  fixCSPChrome130(manifest);
}

if (targetBrowser === 'firefox') {
  delete manifest.minimum_chrome_version;
  manifest.browser_specific_settings.gecko.strict_min_version = '140.0';
  manifest.browser_specific_settings.gecko.data_collection_permissions = {
    required: ['none'],
  };
  manifest.browser_specific_settings.gecko_android = {
    strict_min_version: '142.0',
  };
}

const json = JSON.stringify(manifest, null, 2);
fs.writeFileSync(manifestPath, json, 'utf8');

fs.rmSync(path.resolve(__dirname, `../${outputDir}/.vite`), {
  force: true,
  recursive: true,
});
