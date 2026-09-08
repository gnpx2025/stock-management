import { CanActivateFn } from '@angular/router';

/** Allow-all placeholder guard until Authentication feature lands. */
export const allowAllGuard: CanActivateFn = () => true;
