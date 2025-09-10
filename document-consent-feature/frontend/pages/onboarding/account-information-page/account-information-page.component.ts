import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { LoadingPlaceholderComponent } from '@app/core/components/loading-placeholder/loading-placeholder.component';
import { RegisterUserPayload } from '@app/core/interfaces/user/register-user-payload.interface';
import { AuthenticationService } from '@app/core/services';
import { markAllControlsAsDirty } from '@app/core/utils/mark-all-controls-as-dirty.function';
import { RegistrationStateService } from '@app/features/registration/services/registration-state.service';
import { RegistrationService } from '@app/features/registration/services/registration.service';
import { UserAdditionalInfoComponent } from '@shared/ui/user-profile-form/user-additional-information/user-additional-information.component';
import { UserContactInformationComponent } from '@shared/ui/user-profile-form/user-contact-information/user-contact-information.component';
import { UserGeneralInformationComponent } from '@shared/ui/user-profile-form/user-general-information/user-general-information.component';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { catchError, of, switchMap } from 'rxjs';

@Component({
    selector: 'app-account-information-page',
    imports: [
        UserAdditionalInfoComponent,
        UserGeneralInformationComponent,
        UserContactInformationComponent,
        RouterLink,
        Button,
        LoadingPlaceholderComponent,
    ],
    templateUrl: './account-information-page.component.html',
})
export class AccountInformationPageComponent {
    protected readonly registrationService = inject(RegistrationService);
    private readonly _authenticationService = inject(AuthenticationService);
    private readonly _destroyRef = inject(DestroyRef);
    private readonly _router = inject(Router);
    private readonly _registrationStateService = inject(RegistrationStateService);
    private readonly _messageService = inject(MessageService);

    readonly authenticatedUser = this._authenticationService.authenticatedUser;
    readonly isRegistrationPending = signal(false);

    constructor() {
        this._registrationStateService.setRegistrationState('account-information');
        if (this.authenticatedUser) {
            this.registrationService.registrationFormGroup.disable();
        }
    }

    onSubmit() {
        const form = this.registrationService.registrationFormGroup;
        if (form.invalid || this.isRegistrationPending()) {
            markAllControlsAsDirty([form]);
            form.markAllAsTouched();
            return;
        }

        const { generalInformation, additionalInformation, contactInformation } =
            this.registrationService.registrationFormGroup.getRawValue();

        const { userLocation } = generalInformation;
        const userTeam = generalInformation.userTeam;

        const { dateOfBirth, gender } = additionalInformation;
        const { phoneNumber, email } = contactInformation;

        const payload: RegisterUserPayload = {
            team: userTeam!,
            location: userLocation!,

            dateOfBirth,
            gender,

            phoneNumber,
            privateEmail: email,
        };

        this.isRegistrationPending.set(true);
        this._authenticationService
            .registerUser(payload)
            .pipe(
                switchMap(() => this._authenticationService.authenticateUser()),
                takeUntilDestroyed(this._destroyRef),
                catchError((error) => {
                    this.isRegistrationPending.set(false);
                    this._messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'There was an error with your registration. Please try again.',
                    });
                    return of(error);
                }),
            )
            .subscribe(() => {
                this.isRegistrationPending.set(false);
                this._router.navigate(['/registration/onboarding/agreements']);
            });
    }
}
