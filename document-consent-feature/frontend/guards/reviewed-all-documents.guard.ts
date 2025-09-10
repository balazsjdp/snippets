import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { RegistrationStateService } from '../services/registration-state.service';

export const reviewedAllDocumentsGuard = () => {
    const registrationStateService = inject(RegistrationStateService);
    return registrationStateService.allDocumentsReviewed()
        ? true
        : inject(Router).createUrlTree(['/registration/onboarding/agreements']);
};
