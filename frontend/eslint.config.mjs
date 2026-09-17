import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/out-tsc'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: [
                'type:core',
                'type:ui',
                'type:i18n',
                'type:shared',
                'type:contracts',
              ],
            },
            {
              sourceTag: 'type:core',
              onlyDependOnLibsWithTags: ['type:shared', 'type:contracts'],
            },
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: [
                'type:core',
                'type:shared',
                'type:contracts',
              ],
            },
            {
              sourceTag: 'type:i18n',
              onlyDependOnLibsWithTags: [
                'type:core',
                'type:shared',
                'type:contracts',
              ],
            },
            {
              sourceTag: 'type:shared',
              onlyDependOnLibsWithTags: ['type:contracts'],
            },
            {
              sourceTag: 'type:contracts',
              onlyDependOnLibsWithTags: [],
            },
            {
              sourceTag: 'scope:shell',
              notDependOnLibsWithTags: ['scope:shell'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    rules: {},
  },
];
