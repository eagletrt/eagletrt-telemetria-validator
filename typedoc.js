module.exports = {
    entryPoints: [
        './source/index.ts'
    ],
    name: '@eagletrt/eagletrt-telemetria-postprocessing',
    excludeExternals: true,
    includeVersion: true,
    tsconfig: 'source/tsconfig.json',
    gaID: process.env.GA_TOKEN,
    excludePrivate: true,
    excludeProtected: true,
    disableSources: true,
    out: './docs/documentation/html'
};