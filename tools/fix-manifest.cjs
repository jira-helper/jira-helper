const fs = require('node:fs');
const path = require('node:path');

const targetBrowser = process.env.BROWSER === 'FIREFOX' ? 'firefox' : 'chrome';
const pathToManifest = targetBrowser === 'firefox' ? 'dist-firefox' : 'dist';
// eslint-disable-next-line import/no-dynamic-require
const manifest = require(`../${pathToManifest}/manifest.json`);

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

const json = JSON.stringify(manifest, null, 2);
fs.writeFileSync(path.resolve(__dirname, '../dist/manifest.json'), json, 'utf8');
