module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/game/test/*.test.js', '**/web/test/*.test.js', '**/server/test/*.test.js'],
  setupFilesAfterEnv: ['./game/test/setup.js'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': '<rootDir>/web/test/styleMock.js',
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg)$': '<rootDir>/web/test/fileMock.js',
    'react-netlify-identity-auth': '<rootDir>/web/react-netlify-identity-auth/index.jsx',
  },
};
