export type EnvironmentName =
  | 'Development'
  | 'Testing'
  | 'Staging'
  | 'Production';

export interface AppConfig {
  environmentName: EnvironmentName;
  apiBaseUrl: string;
}
