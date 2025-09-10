import { DOCUMENT, NgClass, ViewportScroller } from '@angular/common';
import {
    Component,
    computed,
    DestroyRef,
    ElementRef,
    inject,
    linkedSignal,
    Signal,
    signal,
    viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { DocumentStatementChoice } from '@app/core/document-consent/interfaces/document-statement-choice.interface';
import { DocumentStatement } from '@app/core/document-consent/interfaces/document-statement.interface';
import { DocumentVersion } from '@app/core/document-consent/interfaces/document-version.interface';
import { DocumentConsentService } from '@app/core/document-consent/services/document-consent.service';
import { AuthenticationService } from '@app/core/services';
import { injectParams } from 'ngxtension/inject-params';
import { injectRouteData } from 'ngxtension/inject-route-data';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { catchError, of } from 'rxjs';
import { LoadingPlaceholderComponent } from '../../../../core/components/loading-placeholder/loading-placeholder.component';
import { DocumentActionComponent } from '../../../../shared/ui/document-review/document-action/document-action.component';
import {
    Breadcrumb,
    DocumentBreadcrumbsComponent,
} from '../../../../shared/ui/document-review/document-breadcrumbs/document-breadcrumbs.component';
import { DocumentHeadingComponent } from '../../../../shared/ui/document-review/document-heading/document-heading.component';
import { TableOfContentsComponent } from '../../../../shared/ui/document-review/table-of-contents/table-of-contents.component';
import { RegistrationStateService } from '../../services/registration-state.service';
import { RegistrationThemeSwitchComponent } from '../registration-theme-switch/registration-theme-switch.component';

interface Section {
    id: string;
    title: string;
}

@Component({
    selector: 'app-document-review-layout',
    imports: [
        NgClass,
        TableOfContentsComponent,
        DocumentHeadingComponent,
        DocumentActionComponent,
        DocumentBreadcrumbsComponent,
        LoadingPlaceholderComponent,
        Button,
        Tooltip,
        RegistrationThemeSwitchComponent,
    ],
    templateUrl: './document-review-layout.component.html',
    styleUrls: ['./document-review-layout.component.scss'],
    host: {
        '[class]': 'layoutClasses()',
    },
})
export class DocumentReviewLayoutComponent {
    private readonly _documentConsentService = inject(DocumentConsentService);
    private readonly _authenticationService = inject(AuthenticationService);

    private readonly _router = inject(Router);
    private readonly _viewportScroller = inject(ViewportScroller);
    private readonly _document = inject(DOCUMENT);
    private readonly _destroyRef = inject(DestroyRef);
    private readonly _registrationStateService = inject(RegistrationStateService);

    readonly showBreadcrumbs = injectRouteData<boolean>('showBreadcrumbs');
    readonly layoutClasses = injectRouteData<string | null>('layoutClasses');
    readonly backToDocumentsUrl = injectRouteData<string | null>('backToDocumentsUrl');
    readonly backUrl = computed(() => {
        if (this.backToDocumentsUrl()) {
            return this.backToDocumentsUrl()!.replace(':userId', this.currentUserId().toString());
        }
        return '/registration/onboarding/agreements';
    });
    readonly showThemeSwitch = injectRouteData<boolean>('showThemeSwitch');
    readonly userId = injectParams('userId');

    /**
     * If the the user param is provided, it means that the user is viewing or editing another user's document.
     * In this case, the check if the current user is an AD admin, then they are allowed to edit the document.
     * Also check if the user param is the same as the current user's id, if so, they are allowed to edit the document.
     *
     * If the user param is not provided, it means that the user is viewing their own document, meaning they are allowed to edit the document.
     */
    readonly allowedToEditChoices = computed(() => {
        const userId = this.userId();
        const currentUser = this._authenticationService.authenticatedUser;
        if (!currentUser) return false;

        if (userId) {
            return currentUser.adAdmin || currentUser.id === +userId;
        }
        return true;
    });

    readonly currentUserId = computed(() => {
        const userId = this.userId();
        if (!userId) return this._authenticationService.authenticatedUser!.id;
        return +userId;
    });

    readonly documentId = injectParams('documentId') as Signal<string>;
    readonly documentVariantsResource = this._documentConsentService.getDocumentVersions(this.documentId);
    readonly documentVariants = computed(() => this.documentVariantsResource.value());
    readonly selectedDocumentVariant = linkedSignal<DocumentVersion | null>(() => this.documentVariants()?.[0] ?? null);
    readonly selectedDocumentVariantId = computed(() => this.selectedDocumentVariant()?.id ?? null);

    readonly documentResource = this._documentConsentService.getDocument(
        this.documentId,
        this.currentUserId(),
        this.selectedDocumentVariantId,
    );
    readonly document = computed(() => this.documentResource.value());
    readonly documentVersion = computed(() => {
        const document = this.document();
        if (!document) return null;
        return document.versions[0];
    });

    readonly isDocumentLoading = computed(
        () => this.documentResource.isLoading() || this.documentVariantsResource.isLoading(),
    );

    readonly documentSections = computed<Section[]>(() => {
        const documentVersion = this.documentVersion();
        if (!documentVersion) return [];

        return documentVersion.contents
            .sort((a, b) => a.order - b.order)
            .map((content) => ({
                id: `section-${content.id}`,
                title: content.title,
            }));
    });

    readonly documentContent = computed(() => {
        const documentVersion = this.documentVersion();
        if (!documentVersion) return [];

        return documentVersion.contents
            .sort((a, b) => a.order - b.order)
            .map((content) => ({
                id: `section-${content.id}`,
                title: content.title,
                content: content.content,
                statements: content.statements,
            }));
    });

    readonly documentBreadcrumbs = computed<Breadcrumb[]>(() => [
        {
            label: 'Agreements',
            routerLink: '/registration/onboarding/agreements',
        },
        {
            label: this.document()?.title ?? '',
            routerLink: `/registration/onboarding/agreements/${this.documentId()}`,
        },
    ]);

    readonly contentContainer = viewChild<ElementRef>('contentContainer');

    readonly activeSection = signal('');
    readonly userStatements = signal<{ statementId: number; choiceId: number | null }[]>([]);

    readonly allDocumentContentStatements = computed(
        () => this.documentContent()?.flatMap((content) => content.statements) ?? [],
    );
    readonly allDocumentContentStatementsFulfilled = computed(() =>
        this.allDocumentContentStatements().every((statement) =>
            this.userStatements().some(
                (userStatement) => userStatement.statementId === statement.id && userStatement.choiceId !== null,
            ),
        ),
    );

    readonly documentGlobalStatements = computed(() => this.documentVersion()?.statements ?? []);
    readonly allGlobalStatementsFulfilled = computed(() =>
        this.documentGlobalStatements().every((statement) =>
            this.userStatements().some(
                (userStatement) => userStatement.statementId === statement.id && userStatement.choiceId !== null,
            ),
        ),
    );

    readonly allStatementsFulfilled = computed(() =>
        this.allDocumentContentStatements()
            .concat(this.documentGlobalStatements())
            .every((statement) =>
                this.userStatements().some(
                    (userStatement) => userStatement.statementId === statement.id && userStatement.choiceId !== null,
                ),
            ),
    );

    readonly isDocumentSaving = signal(false);

    constructor() {
        this._registrationStateService.setRegistrationState('agreements');
    }

    saveDocument() {
        if (!this.allStatementsFulfilled()) return;

        const payload = {
            userId: this.currentUserId(),
            statements: this.userStatements().map((statement) => ({
                statementTime: new Date().toISOString(),
                statementId: statement.statementId,
                choiceId: statement.choiceId,
            })),
        };

        this.isDocumentSaving.set(true);
        this._documentConsentService
            .saveConsent(payload)
            .pipe(
                takeUntilDestroyed(this._destroyRef),
                catchError((error) => {
                    this.isDocumentSaving.set(false);
                    return of(error);
                }),
            )
            .subscribe(() => {
                this.isDocumentSaving.set(false);
                this._router.navigate([this.backUrl()]);
            });
    }

    onStatementChange(statementId: DocumentStatement['id'], value: DocumentStatementChoice | null) {
        if (!this.allowedToEditChoices()) return;

        this.userStatements.update((statements) => {
            const statement = { statementId, choiceId: value?.id ?? null };
            const index = statements.findIndex((s) => s.statementId === statementId);
            return index === -1
                ? [...statements, statement]
                : [...statements.slice(0, index), statement, ...statements.slice(index + 1)];
        });

        // eslint-disable-next-line no-console
        console.table({
            userStatements: this.userStatements(),
            allDocumentContentStatementsFulfilled: this.allDocumentContentStatementsFulfilled(),
            allGlobalStatementsFulfilled: this.allGlobalStatementsFulfilled(),
            allStatementsFulfilled: this.allStatementsFulfilled(),
        });
    }

    scrollToSection(sectionId: string | null, event?: MouseEvent) {
        if (!sectionId) return;

        event?.preventDefault();
        this._viewportScroller.scrollToAnchor(sectionId);
        this._document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
}
