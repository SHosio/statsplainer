const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5001',
    testIsolation: false,
    //supportFile: false,
    // setupNodeEvents(on, config) {}
  },
  // component: {
  //   devServer: {
  //     framework: "react",
  //     bundler: "vite",
  //   },
  // }
});