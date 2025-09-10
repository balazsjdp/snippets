import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { RegistrationThemeSwitchComponent } from '../registration-theme-switch/registration-theme-switch.component';

@Component({
    selector: 'app-onboarding-page-layout',
    imports: [RouterOutlet, NgClass, RegistrationThemeSwitchComponent, ToastModule],
    templateUrl: './onboarding-page-layout.component.html',
    styleUrls: ['./onboarding-page-layout.component.scss'],
})
export class OnboardingPageLayoutComponent {
    readonly router = inject(Router);

    readonly steps = [
        {
            label: 'Account Info',
            path: 'account-information',
        },
        {
            label: 'Agreements',
            path: 'agreements',
        },
        {
            label: 'Completed',
            path: 'completed',
        },
    ];
}
