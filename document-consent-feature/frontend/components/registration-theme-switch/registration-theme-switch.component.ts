import { afterRenderEffect, Component, inject, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '@app/core/services/theme/theme.service';
import { ToggleSwitch } from 'primeng/toggleswitch';

@Component({
    selector: 'app-registration-theme-switch',
    templateUrl: './registration-theme-switch.component.html',
    imports: [FormsModule, ToggleSwitch],
})
export class RegistrationThemeSwitchComponent {
    private readonly _themeService = inject(ThemeService);
    private readonly _theme = toSignal(this._themeService.darkMode$);
    selectedTheme = linkedSignal<boolean>(() => this._theme() === 'dark');

    constructor() {
        afterRenderEffect(() => {
            this._themeService.setDarkMode(this.selectedTheme() ? 'dark' : 'light');
        });
    }
}
