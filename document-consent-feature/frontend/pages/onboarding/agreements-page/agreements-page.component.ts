import { DOCUMENT } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LoadingPlaceholderComponent } from '@app/core/components/loading-placeholder/loading-placeholder.component';
import { DocumentList, isCompleted } from '@app/core/document-consent/interfaces/document-list.interface';
import { DocumentConsentService } from '@app/core/document-consent/services/document-consent.service';
import { AuthenticationService } from '@app/core/services';
import { isNewerVersion } from '@app/core/utils/is-newer-version';
import { UserRespondedPipe } from '@app/features/registration/pipes/user-responded.pipe';
import { RegistrationStateService } from '@app/features/registration/services/registration-state.service';
import { DocumentCardStatus } from '@app/shared/ui/document-card/document-card-status.enum';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidFileCircleXmark } from '@ng-icons/font-awesome/solid';
import { DocumentCardComponent } from '@shared/ui/document-card/document-card.component';
import { Button } from 'primeng/button';
import { Panel } from 'primeng/panel';
import { map } from 'rxjs';

@Component({
    selector: 'app-agreements-page',
    viewProviders: [provideIcons({ faSolidFileCircleXmark })],
    imports: [RouterLink, DocumentCardComponent, NgIcon, LoadingPlaceholderComponent, UserRespondedPipe, Button, Panel],
    templateUrl: './agreements-page.component.html',
})
export class AgreementsPageComponent {
    private readonly _document = inject(DOCUMENT);
    private readonly _documentConsentService = inject(DocumentConsentService);
    private readonly _authenticationService = inject(AuthenticationService);
    private readonly _registrationStateService = inject(RegistrationStateService);

    protected readonly DocumentCardStatus = DocumentCardStatus;
    protected readonly authenticatedUser = this._authenticationService.authenticatedUser;

    readonly isReducedMotion = this._document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)') ?? false;

    readonly documentList = toSignal<DocumentList[] | null>(
        this._documentConsentService.getDocumentList(this._authenticationService.authenticatedUser!.id).pipe(
            map((documents) =>
                documents.map((document) => ({
                    ...document,
                    versions: document.versions.sort((a, b) =>
                        isNewerVersion(a.version.toString(), b.version.toString()) ? 1 : -1,
                    ),
                })),
            ),
            // map(() => []), // Uncomment this to test empty state
            // map(() => null), // Uncomment this to test loading state
        ),
        { initialValue: null },
    );
    readonly isEveryDocumentSigned = computed(() =>
        this.documentList()?.every((document) => document.versions.some(isCompleted)),
    );

    constructor() {
        this._registrationStateService.setRegistrationState('agreements');
    }

    onContinue() {
        this._registrationStateService.markDocumentsReviewed();
    }
}
