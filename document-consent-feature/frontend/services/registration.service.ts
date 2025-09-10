import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Location, Team } from '@app/core/models';

@Injectable({ providedIn: 'root' })
export class RegistrationService {
    registrationFormGroup = new FormGroup({
        generalInformation: new FormGroup({
            userTeam: new FormControl<Team | null>(null, [Validators.required]),
            userLocation: new FormControl<Location | null>(null, [Validators.required]),
        }),
        additionalInformation: new FormGroup({
            dateOfBirth: new FormControl<Date | null>(null),
            gender: new FormControl<string | null>(null),
        }),
        contactInformation: new FormGroup({
            phoneNumber: new FormControl<string | null>(null),
            email: new FormControl<string | null>(null, Validators.email),
        }),
    });
}
