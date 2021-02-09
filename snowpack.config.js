/* eslint-disable */
// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/#configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
    // mount: {},
    plugins: [['@snowpack/plugin-typescript', { tsc: 'ttsc', args: ' --project tsconfig.build.json' }]],
    // installOptions: {},a
    // devOptions: {},
    // buildOptions: {},
    alias: {
        '@/': './src/',
    },
};
