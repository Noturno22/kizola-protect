// Fix: EMFILE "too many open files" no Windows.
// O graceful-fs faz monkey-patch ao módulo fs nativo para gerir os limites
// de file descriptors do Windows, retrying automaticamente quando o limite é atingido.
const gracefulFs = require('graceful-fs');
gracefulFs.gracefulify(require('fs'));

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Fix: EMFILE – limitar workers do Metro para reduzir ficheiros abertos em simultâneo.
// No Windows o limite por defeito (número de CPUs) causa esgotamento de file handles.
config.maxWorkers = 2;

// Fix: Bloquear node_modules aninhados (ex: app/node_modules) para evitar que o Metro
// indexe dependências duplicadas, que causam EMFILE e builds mais lentos.
config.resolver = config.resolver ?? {};
config.resolver.blockList = [
  /.*\/app\/node_modules\/.*/,
  /.*\\app\\node_modules\\.*/,
];

// Remover as substituições de resolução problemáticas
// O Metro na SDK 50+ lida com ESM (mjs) sem problemas.

module.exports = config;