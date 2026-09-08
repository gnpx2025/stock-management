export type HealthStatusEnum = 'Healthy' | 'Degraded' | 'Unhealthy';

export interface ComponentHealth {
  name: string;
  status: HealthStatusEnum;
  description?: string;
}

export interface HealthStatus {
  status: HealthStatusEnum;
  checkedAtUtc: string;
  api: ComponentHealth;
  database: ComponentHealth;
  correlationId?: string;
}
