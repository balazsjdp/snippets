import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from '@app/core/services/localstorage.service';

const IS_REGISTERING_KEY = 'registration_isRegistering';
const ALL_DOCS_REVIEWED_KEY = 'registration_allDocumentsReviewed';
const REGISTRATION_STATE_KEY = 'registration_state';

export type RegistrationState = 'welcome' | 'account-information' | 'agreements' | 'completed';

/**
 * Manages the state related to the user registration process, persisting across page refreshes using local storage.
 * This service tracks whether the user is currently in registration mode
 * and whether they have reviewed all necessary documents.
 */
@Injectable({
    providedIn: 'root',
})
export class RegistrationStateService {
    private readonly _platformId = inject(PLATFORM_ID);
    private readonly _router = inject(Router);
    private readonly _localStorage = inject(LocalStorageService);

    // Initialize signals from local storage if available (browser only)
    private _$isRegistering = signal<boolean>(this._loadInitialState(IS_REGISTERING_KEY));
    private _$allDocumentsReviewed = signal<boolean>(this._loadInitialState(ALL_DOCS_REVIEWED_KEY));
    private _$registrationState = signal<RegistrationState>(this._loadInitialRegistrationState(REGISTRATION_STATE_KEY));

    /**
     * Signal indicating if the user is currently in the registration flow.
     */
    readonly isRegistering = this._$isRegistering.asReadonly();

    /**
     * Signal indicating if the user has reviewed all required documents during registration.
     */
    readonly allDocumentsReviewed = this._$allDocumentsReviewed.asReadonly();

    /**
     * Signal indicating the current state of the registration process.
     */
    readonly registrationState = this._$registrationState.asReadonly();

    /**
     * Computed signal determining if the user is allowed to navigate away from registration routes.
     * Navigation is allowed if the user is not registering OR if they have reviewed all documents.
     */
    readonly canLeaveRegistration = computed<boolean>(
        () => !this.isRegistering() || this.registrationState() === 'completed',
    );

    /**
     * Starts the registration process by setting the registering state to true
     * and resetting the document review status in both the signal and local storage.
     */
    startRegistration(): void {
        this._setState(IS_REGISTERING_KEY, true);
        this._setState(ALL_DOCS_REVIEWED_KEY, false); // Reset review status when starting
        this._setState(REGISTRATION_STATE_KEY, 'welcome');

        this._$isRegistering.set(true);
        this._$allDocumentsReviewed.set(false);
        this._$registrationState.set('welcome');
    }

    /**
     * Marks all registration documents as reviewed in both the signal and local storage.
     */
    markDocumentsReviewed(): void {
        this._setState(ALL_DOCS_REVIEWED_KEY, true);
        this._$allDocumentsReviewed.set(true);
    }

    /**
     * Sets the registration state to the next step in the process.
     */
    setRegistrationState(state: RegistrationState): void {
        this._setState(REGISTRATION_STATE_KEY, state);
        this._$registrationState.set(state);
    }

    /**
     * Resets the registration state in both the signal and local storage,
     * typically called when registration is completed or cancelled.
     */
    resetRegistration(): void {
        this._clearState(); // Also clear from storage

        this._setState(IS_REGISTERING_KEY, false);
        this._setState(ALL_DOCS_REVIEWED_KEY, false);
        this._setState(REGISTRATION_STATE_KEY, 'welcome');

        this._$isRegistering.set(false);
        this._$allDocumentsReviewed.set(false);
        this._$registrationState.set('welcome');
    }

    moveToCurrentState(): Promise<boolean> {
        const currentState = this.registrationState();
        if (currentState === 'account-information') {
            return this._router.navigate(['/registration/onboarding/account-information']);
        } else if (currentState === 'agreements') {
            return this._router.navigate(['/registration/onboarding/agreements']);
        } else if (currentState === 'completed') {
            return this._router.navigate(['/registration/onboarding/completed']);
        }
        return this._router.navigate(['/registration/welcome']);
    }

    /** Helper to load initial state from local storage */
    private _loadInitialState(key: string): boolean {
        if (isPlatformBrowser(this._platformId)) {
            const storedValue = this._localStorage.getItem(key);
            return storedValue === 'true'; // Convert string 'true' to boolean true
        }
        return false; // Default state if not in browser or nothing stored
    }

    private _loadInitialRegistrationState(key: string): RegistrationState {
        if (isPlatformBrowser(this._platformId)) {
            const storedValue = this._localStorage.getItem(key);
            return storedValue as RegistrationState;
        }
        return 'welcome';
    }

    /** Helper to set state in local storage */
    private _setState(key: string, value: boolean | RegistrationState): void {
        if (isPlatformBrowser(this._platformId)) {
            this._localStorage.setItem(key, String(value));
        }
    }

    /** Helper to clear state from local storage */
    private _clearState(): void {
        if (isPlatformBrowser(this._platformId)) {
            this._localStorage.removeItem(IS_REGISTERING_KEY);
            this._localStorage.removeItem(ALL_DOCS_REVIEWED_KEY);
            this._localStorage.removeItem(REGISTRATION_STATE_KEY);
        }
    }
}
