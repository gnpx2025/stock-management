import { InjectionToken } from '@angular/core';
import type { TokenStorage } from '@erp/contracts';

export const TOKEN_STORAGE = new InjectionToken<TokenStorage>('TOKEN_STORAGE');
