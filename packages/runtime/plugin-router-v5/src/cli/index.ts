import {
  getEntryOptions,
  createRuntimeExportsUtils,
  isRouterV5 as isV5,
} from '@modern-js/utils';
import { ServerRoute } from '@modern-js/types';
import type { AppTools, CliPlugin } from '@modern-js/app-tools';
import './types';

const PLUGIN_IDENTIFIER = 'router';

const ROUTES_IDENTIFIER = 'routes';

export const routerPlugin = (): CliPlugin<AppTools> => ({
  name: '@modern-js/plugin-router-v5',
  required: ['@modern-js/runtime'],
  setup: api => {
    const runtimeConfigMap = new Map<string, any>();

    let pluginsExportsUtils: any;
    let routerExportsUtils: any;

    return {
      config() {
        const appContext = api.useAppContext();
        pluginsExportsUtils = createRuntimeExportsUtils(
          appContext.internalDirectory,
          'plugins',
        );

        // .modern-js/.runtime-exports/router (legacy)
        routerExportsUtils = createRuntimeExportsUtils(
          appContext.internalDirectory,
          'router',
        );

        return {
          source: {
            alias: {
              '@modern-js/runtime/plugins': pluginsExportsUtils.getPath(),
              '@modern-js/runtime/router-v5': routerExportsUtils.getPath(),
            },
          },
        };
      },
      validateSchema() {
        return [
          {
            target: 'runtime.router',
            schema: { type: ['boolean', 'object'] },
          },
        ];
      },
      modifyEntryImports({ entrypoint, imports }) {
        const { entryName, isMainEntry } = entrypoint;
        const userConfig = api.useResolvedConfigContext();
        const { packageName } = api.useAppContext();

        const runtimeConfig = getEntryOptions(
          entryName,
          isMainEntry,
          userConfig.runtime,
          userConfig.runtimeByEntries,
          packageName,
        );

        runtimeConfigMap.set(entryName, runtimeConfig);

        if (isV5(userConfig)) {
          imports.push({
            value: '@modern-js/runtime/plugins',
            specifiers: [{ imported: PLUGIN_IDENTIFIER }],
          });
        } else {
          throw new Error(
            `should enable runtime.router.mode for entry ${entryName}`,
          );
        }

        return {
          entrypoint,
          imports,
        };
      },
      modifyEntryRuntimePlugins({ entrypoint, plugins }) {
        const { entryName, fileSystemRoutes } = entrypoint;
        const { serverRoutes } = api.useAppContext();
        const runtimeConfig = runtimeConfigMap.get(entryName);

        const userConfig = api.useResolvedConfigContext();

        if (isV5(userConfig)) {
          // Todo: plugin-router best to only handle manage client route.
          // here support base server route usage, part for compatibility
          const serverBase = serverRoutes
            .filter((route: ServerRoute) => route.entryName === entryName)
            .map(route => route.urlPath)
            .sort((a, b) => (a.length - b.length > 0 ? -1 : 1));

          plugins.push({
            name: PLUGIN_IDENTIFIER,
            options: JSON.stringify({
              serverBase,
              ...runtimeConfig.router,
              routesConfig: fileSystemRoutes
                ? `{ ${ROUTES_IDENTIFIER}, globalApp: App }`
                : undefined,
            }).replace(
              /"routesConfig"\s*:\s*"((\S|\s)+)"/g,
              '"routesConfig": $1,',
            ),
          });
        }
        return {
          entrypoint,
          plugins,
        };
      },
      addRuntimeExports() {
        const userConfig = api.useResolvedConfigContext();
        if (isV5(userConfig)) {
          pluginsExportsUtils.addExport(
            `export { default as router } from '@modern-js/plugin-router-v5/runtime'`,
          );
          routerExportsUtils?.addExport(
            `export * from '@modern-js/plugin-router-v5/runtime'`,
          );
        }
      },
    };
  },
});

export default routerPlugin;
