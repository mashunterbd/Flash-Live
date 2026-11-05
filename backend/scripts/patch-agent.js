import fs from 'fs';
import path from 'path';

// Fix Node 26 compatibility for node-fetch-native-with-agent
const pkgPath = path.resolve('node_modules/node-fetch-native-with-agent/package.json');

if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  
  // Point root export for node to native.mjs / native.cjs
  pkg.exports['.'].node = {
    import: './dist/native.mjs',
    require: './dist/native.cjs'
  };

  // Stub agent creation so invalid dispatcher is not passed to undici in Node 26
  pkg.exports['./agent'] = {
    node: './dist/agent-stub.cjs',
    default: './dist/agent-stub.mjs'
  };

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
  console.log('[Patch] Successfully configured node-fetch-native-with-agent for Node 26 native fetch.');
}
