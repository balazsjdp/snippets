import { Routes } from '@angular/router';
import { DocumentReviewLayoutComponent } from '@app/features/registration/components/document-review-layout/document-review-layout.component';
import { OnboardingPageLayoutComponent } from './components/onboarding-page-layout/onboarding-page-layout.component';
import { reviewedAllDocumentsGuard } from './guards/reviewed-all-documents.guard';
import { AccountInformationPageComponent } from './pages/onboarding/account-information-page/account-information-page.component';
import { AgreementsPageComponent } from './pages/onboarding/agreements-page/agreements-page.component';
import { CompletedPageComponent } from './pages/onboarding/completed-page/completed-page.component';
import { WelcomePageComponent } from './pages/welcome-page/welcome-page.component';

export const registrationRoutes: Routes = [
    {
        path: 'welcome',
        title: 'Registration - Welcome',
        component: WelcomePageComponent,
    },
    {
        path: 'onboarding/agreements/:documentId',
        title: 'Registration - Agreements',
        component: DocumentReviewLayoutComponent,
        data: {
            showBreadcrumbs: true,
            showThemeSwitch: true,
        },
    },
    {
        path: 'onboarding',
        title: 'Registration - Onboarding',
        component: OnboardingPageLayoutComponent,
        children: [
            {
                path: 'account-information',
                title: 'Registration - Account Information',
                component: AccountInformationPageComponent,
            },
            {
                title: 'Registration - Agreements',
                path: 'agreements',
                component: AgreementsPageComponent,
            },
            {
                title: 'Registration - Completed',
                path: 'completed',
                canActivate: [reviewedAllDocumentsGuard],
                component: CompletedPageComponent,
            },
            {
                path: '**',
                pathMatch: 'full',
                redirectTo: 'account-information',
            },
        ],
    },
    {
        path: '**',
        pathMatch: 'full',
        redirectTo: 'welcome',
    },
];
