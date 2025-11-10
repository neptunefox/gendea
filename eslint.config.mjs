import withNuxt from './.nuxt/eslint.config.mjs'
import prettier from 'eslint-config-prettier'

export default withNuxt(
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-multiple-template-root': 'off'
    }
  },
  {
    files: ['server/**/*.{js,ts}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'nuxt/app',
              message:
                "Server runtime forbids Vue app aliases (impound). Fix: replace with server-safe APIs (e.g., `import { createError } from 'h3'`) or rely on server auto-imports."
            },
            {
              name: '#app',
              message:
                "'#app' is a Vue app alias and not allowed in server runtime (impound). Use 'h3' utilities or server auto-imports instead."
            },
            {
              name: '#build',
              message:
                "'#build' is a build-time alias and not allowed in server runtime. Remove this import; prefer runtime-safe utilities (e.g., useRuntimeConfig(event))."
            }
          ],
          patterns: ['#build/*']
        }
      ]
    }
  },
  prettier
)
