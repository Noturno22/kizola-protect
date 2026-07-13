const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Fix: lucide-react-native v1.x aponta o campo "react-native" para um ficheiro .mjs
// que o Metro não consegue resolver correctamente, causando ícones renderizados
// como quadrados com X. Forçamos a resolução para o CJS.
config.resolver = config.resolver ?? {};
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'lucide-react-native') {
    return {
      filePath: path.resolve(
        __dirname,
        'node_modules/lucide-react-native/dist/cjs/lucide-react-native.js'
      ),
      type: 'sourceFile',
    };
  }
  // Delegar tudo o resto ao resolver padrão
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;