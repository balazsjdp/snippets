import { DOCUMENT, NgOptimizedImage } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, ElementRef, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';
import { RegistrationThemeSwitchComponent } from '../../components/registration-theme-switch/registration-theme-switch.component';
import { RegistrationStateService } from '../../services/registration-state.service';

@Component({
    selector: 'app-welcome-page',
    imports: [RouterLink, NgOptimizedImage, RegistrationThemeSwitchComponent],
    templateUrl: './welcome-page.component.html',
    styles: `
        :host {
            font-size: 16px !important;
        }

        ::ng-deep html,
        ::ng-deep body {
            font-size: 16px !important;
            overflow: hidden;
        }
    `,
})
export class WelcomePageComponent implements AfterViewInit {
    private readonly _registrationStateService = inject(RegistrationStateService);

    private readonly _document = inject(DOCUMENT);
    private readonly _destroyRef = inject(DestroyRef);

    private readonly _svgContainer = viewChild.required<ElementRef>('svgContainer');

    constructor() {
        this._registrationStateService.startRegistration();
    }

    ngAfterViewInit() {
        const svg = this._svgContainer().nativeElement;
        fromEvent<MouseEvent>(this._document, 'mousemove')
            .pipe(
                map((event) => ({
                    clientX: event.clientX,
                    clientY: event.clientY,
                })),
                takeUntilDestroyed(this._destroyRef),
            )
            .subscribe(({ clientX, clientY }) => this.updateMousePosition(clientX, clientY, svg));
    }

    updateMousePosition(clientX: number, clientY: number, svg: SVGElement) {
        const rect = svg.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
            svg.style.setProperty('--mouse-x', `${x}px`);
            svg.style.setProperty('--mouse-y', `${y}px`);
        }
    }
}
