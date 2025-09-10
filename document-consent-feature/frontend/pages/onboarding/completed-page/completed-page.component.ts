import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AuthenticationService, RightService } from '@app/core/services';
import { CustomPreloadStrategyService } from '@app/core/services/custom-preload-strategy.service';
import { LoggerService } from '@app/core/services/logger.service';
import { createConfetti } from '@app/core/utils/create-confetti.function';
import { RegistrationStateService } from '@app/features/registration/services/registration-state.service';
import { RegistrationService } from '@app/features/registration/services/registration.service';
import { AuthActions } from '@app/store/auth-state/actions';
import { NotificationActions } from '@app/store/notification-state/actions';
import { Store } from '@ngrx/store';
import { Button } from 'primeng/button';
import { Panel } from 'primeng/panel';
import { combineLatest, scan, take, takeWhile, tap, timer } from 'rxjs';

@Component({
    selector: 'app-completed-page',
    imports: [RouterLink, Button, Panel],
    templateUrl: './completed-page.component.html',
})
export class CompletedPageComponent implements OnInit {
    readonly registrationService = inject(RegistrationService);

    private readonly _destroyRef = inject(DestroyRef);

    private readonly _customPreloadStrategyService = inject(CustomPreloadStrategyService);
    private readonly _authenticationService = inject(AuthenticationService);
    private readonly _rightService = inject(RightService);
    private readonly _store = inject(Store);
    private readonly _loggerService = inject(LoggerService);
    private readonly _registrationStateService = inject(RegistrationStateService);

    readonly isUserRegistered = signal(false);
    readonly registrationError = signal<string | null>(null);
    readonly authenticatedUser = this._authenticationService.authenticatedUser;

    readonly timer = toSignal(
        timer(0, 1000).pipe(
            scan((acc: number) => acc + 1, 0),
            takeWhile((value: number) => value < 180),
            takeUntilDestroyed(),
        ),
        { initialValue: 0 },
    );

    constructor() {
        this._registrationStateService.resetRegistration();
    }

    ngOnInit() {
        const confettiCanvas = document.getElementById('confetti-canvas');
        if (confettiCanvas) {
            queueMicrotask(() => {
                createConfetti(confettiCanvas);
            });
        }

        this._fetchUserRights();

        this._loggerService.debug(
            `[CompletedPageComponent] Preload state: ${this._customPreloadStrategyService.preloadMap.size}`,
        );
        if (this._customPreloadStrategyService.preloadMap.size > 0) {
            this._loggerService.debug(
                `[CompletedPageComponent] Preloads started for: ${JSON.stringify(
                    Array.from(this._customPreloadStrategyService.preloadMap.keys()).join(', '),
                )}`,
            );
            const preloads = Array.from(this._customPreloadStrategyService.preloadMap.entries()).map(
                ([route, preload]) =>
                    preload().pipe(
                        take(1),
                        // eslint-disable-next-line no-console
                        tap(() => console.log(`Preloaded route: ${route}`)),
                    ),
            );
            combineLatest(preloads)
                .pipe(takeUntilDestroyed(this._destroyRef))
                .subscribe(() => {
                    this._loggerService.debug('[CompletedPageComponent] Preloads completed');
                });
            this._customPreloadStrategyService.preloadMap.clear();
        } else {
            this._loggerService.debug('[CompletedPageComponent] Preloads skipped');
        }
    }

    private _fetchUserRights() {
        const currentUser = this._authenticationService.authenticatedUser;
        if (!currentUser) {
            return;
        }
        this._rightService
            .getUserRights(currentUser.id)
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe((rights) => {
                this._store.dispatch(AuthActions.login({ user: currentUser }));
                this._store.dispatch(NotificationActions.loadNotifications());
                this._store.dispatch(AuthActions.setUserRights({ rights }));
                this.isUserRegistered.set(true);

                this._loggerService.log('[CompletedPageComponent] User is registered');
            });
    }
}
