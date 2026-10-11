module.exports = {
  parserOptions: {
    sourceType: "module",
  },
  extends: ["eslint:recommended", "prettier", "plugin:react/recommended"],
  settings: {
    react: {
      version: "16.13",
    },
  },
  rules: {
    "react/prop-types": "off",
    "react/display-name": "off",
  },
}
