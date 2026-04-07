export default {
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/client/src/views/__tests__/setup.js'],
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.js$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(vue|@vue/test-utils)/)'
  ],
  moduleFileExtensions: ['js', 'vue'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/client/src/$1'
  },
  testMatch: [
    '**/__tests__/**/*.spec.js'
  ]
};
