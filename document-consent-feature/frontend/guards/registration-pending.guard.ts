import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { RegistrationStateService } from '../services/registration-state.service';

/**
 * This guard is used to prevent the user from accessing other routes while the registration is pending.
 * @returns true if the registration is pending, otherwise it will navigate to the current state.
 */
export const registrationPendingGuard = () => {
    const registrationStateService = inject(RegistrationStateService);
    return registrationStateService.canLeaveRegistration()
        ? registrationStateService.moveToCurrentState()
        : inject(Router).createUrlTree(['/shiftplan']);
};
