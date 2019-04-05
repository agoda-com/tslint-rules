module.exports = {
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js"
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  testMatch: [
    "**/**/*.spec.(ts|tsx)",
    "**/**/*.test.(ts|tsx)"
  ],
  testEnvironment: "node"
};