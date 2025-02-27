# Using Storybook

[Storybook](https://storybook.js.org/) is a tool dedicated to component debugging, providing around component development.

- Develop UIs that are more durable
- Test UIs with less effort and no flakes
- Document UI for your team to reuse
- Share how the UI actually works
- Automate UI workflows

Before when using Storybook, there are various problems related to configurations, Babel, Webpack, less or sass, but those are already included in Modern.js builder, using Modern.js builder can make your configurations a log easier.

You can switch between Webpack and Rspack smoothly in Modern.js builder, for those who already use Modern.js builder or Modern.js framework, you can start using Storybook with the same configurations.

## Enable Storybook

### Use in Modern.js projects

#### Haven't used legacy Storybook plugin(@modern-js/plugin-storybook)

If your current project is already a Modern.js project and you haven't used any old version Storybook plugins, you can directly enable the Storybook feature by using the following command:

```bash
$ npx modern new
? Please select the operation you want: Enable features
? Please select the feature name: Enable「Storybook」V7
```

This command will create a template for Storybook, including:

- Creating a configuration folder .storybook and a default configuration file .storybook/main.ts.
- Creating example story components.
- Updating package.json to add dependencies @storybook/addon-essentials and @modern-js/storybook, as well as creating Storybook-related scripts.

#### Using legacy Storybook plugin(@modern-js/plugin-storybook)

If you are using an older version of the Storybook plugin, you can still run the command above to create templates and modify the package.json. You can also upgrade manually.

If you have made some custom configurations to Storybook in the older version, you need to move the configuration files from `root/config/storybook/` to the `root/.storybook/ directory`.

Specify framework as `@modern-js/storybook` in `root/.storybook/main.(j|t)s`.

```diff
const config = {
+  framework: '@modern-js/storybook'
};

export default config;
```

Update dependencies like @storybook/addon-\* to major version 7.

Finally, follow the official Storybook documentation to make the necessary updates for some breaking changes, such as changes in story writing and MDX syntax. You can refer to the migration guide at [storybook migrate doc](https://storybook.js.org/docs/react/migration-guide).

### Native Storybook users

Modern.js Builder only support Storybook 7, so you need to upgrade from Storybook version 6 to version 7, please follow the steps outlined in the official Storybook documentation at [storybook migrate doc](https://storybook.js.org/docs/react/migration-guide).

To install @modern-js/storybook as the framework for Storybook, if you have interest in Rspack, install `@modern-js/builder-provider-rspack`, otherwise you should install `@modern-js/builder-provider-webpack`. Rspack is super fast compared to Webpack.

```diff filename='.storybook/main.js'
const config = {
-  framework: '@storybook/react-webapck5',
+  framework: '@modern-js/storybook',
};

export default config;
```

The default config file is `modern.config.(j|t)s`, for the detail config, see [builder config](https://modernjs.dev/builder/guide/basic/builder-config.html).

If the original project includes configurations for Babel, they need to be written in the modern configuration. Most Babel configurations have already been included in Modern.js.

## Enable Rspack build

Rspack is known for its fast build speed. To use Rspack as a build tool in Modern.js, you only need to configure it as follows:

```diff filename='.storybook/main.js'
const config = {
  framework: {
    name: '@modern-js/storybook',
    options: {
-      bundler: 'webpack'
+      bundler: 'rspack'
    },
    typescript: {
-      reactDocgen: 'react-docgen-typescript'
+      reactDocgen: 'react-docgen'
    }
  }
};

export default config;
```

Note that in the above configuration, the reactDocgen configuration has been changed because Rspack currently does not support @storybook/react-docgen-typescript-plugin.

Before starting, make sure that you have installed the @modern-js/builder-rspack-provider package.

## Configurations

There are some configurations in `.storybook/main.js`.

### configPath

- **Type**: `string`
- **Default**: `modern.config.(j|t)s`

Specify the path of Modern.js Builder configuration.

Example:

```javascript filename='.storybook/main.js'
const config = {
  framework: {
    name: '@modern-js/storybook',
    options: {
      configPath: 'modern.storybook.config.ts'
    }
  }
};

export default config;
```

#### bundler

- **Type**: `'webpack' | 'rspack'`
- **Default**: `webpack`

Specify the underlying build tool to use either Webpack or Rspack. Please make sure to install the corresponding provider. To use Webpack, install @modern-js/builder-webpack-provider. To use Rspack, install @modern-js/builder-rspack-provider.

Example:

```javascript filename='.storybook/main.js'
const config = {
  framework: {
    name: '@modern-js/storybook',
    options: {
      bundler: 'rspack'
    }
  }
};

export default config;
```

#### builderConfig

- **Type**: `BuilderConfig`
- **Default**: `undefined`

To modify the configuration of the builder, which has a higher priority than the configuration file, you can specify the Modern.js builder configuration directly here if you do not want to use the configuration file.

Example:

```javascript filename='.storybook/main.js'
const config = {
  framework: {
    name: '@modern-js/storybook',
    options: {
      builderCofnig: {
        alias: {
          react: require.resolve('react'),
          'react-dom': require.resolve('react-dom'),
        }
      }
    }
  }
};

export default config;
```

#### ConfigFile

The configuration file includes an additional field: `builderPlugins`, in addition to the Modern.js builder configuration. This field is used to enable builder plugins, such as enabling SWC compilation.

```typescript filename='modern.config.ts'
import { defineConfig } from '@modern-js/storybook';
import { builderPluginSwc } from '@modern-js/builder-plugin-swc';

const config = defineConfig({
  builderPlugins: [builderPluginSwc()]
});

export default config;
```

## Benefits

Using @modern-js/storybook can bring you lightning-fast builds with Rspack, without the need for tedious configuration. It comes with many best practices for web development out-of-the-box, such as code splitting strategies, built-in support for CSS modules and postcss, TypeScript support, and commonly used Babel plugins.

The powerful capabilities of Modern.js builder can be directly used in Storybook projects.

## Trouble Shooting

1. Modern.js builder won't load your other configurations like `babel.config.json`, babel config needs to be set in Modern.js config, [tools.babel](/api/config-tools.html#toolsbabel).
Webpack configuration can be written in either [tools.webpack](/api/config-tools.html#toolswebpack) or [tools.webpackChain](/api/config-tools.html#toolswebpackchain).

2. If you find that the build performance is not good, please check if the Storybook automatic documentation generation feature is enabled. For optimal performance, configure it to use `react-docgen`. The difference between `react-docgen` and `react-docgen-typescript` is that the former is implemented based on Babel, while the latter is implemented based on TypeScript. The former has better performance but weaker type inference capabilities. If you are using Rspack for the build, only `react-docgen` is supported.

```javascript filename='.storybook/main.js'
const config = {
  typescript: {
    reactDocgen: 'react-docgen'
  }
}

export default config
```
