import { defineConfig } from '@modern-js/module-tools/defineConfig';

export default defineConfig({
  buildConfig: {
    input: ['./index.ts'],
    platform: 'browser',
  },
});
