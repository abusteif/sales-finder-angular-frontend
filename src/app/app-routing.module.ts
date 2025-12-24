import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';
import { ActivationConfirmationPageComponent } from './pages/activation-confirmation-page/activation-confirmation-page.component';
import { AccountActivationPageComponent } from './pages/account-activation-page/account-activation-page.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { UpgradePageComponent } from './pages/upgrade-page/upgrade-page.component';
import { AlertsPageComponent } from './pages/alerts-page/alerts-page.component';
import { PasswordResetConfirmPageComponent } from './pages/password-reset-confirm-page/password-reset-confirm-page.component';
import { ForgotPasswordPageComponent } from './pages/forgot-password-page/forgot-password-page.component';
import { ContactUsPageComponent } from './pages/contact-us-page/contact-us-page.component';
import { FaqPageComponent } from './pages/faq-page/faq-page.component';
import { AboutUsPageComponent } from './pages/about-us-page/about-us-page.component';
import { ItemDetailsPageComponent } from './pages/item-details-page/item-details-page.component';
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component';
import { authGuard, publicGuard, ActivationConfirmationGuard, homeGuard } from './core/guards';
import { GENERIC_SETTINGS } from './core/constants/generic-settings';

const APP_NAME = GENERIC_SETTINGS.app_name;
const DEFAULT_ROBOTS = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
const NOINDEX_ROBOTS = 'noindex, nofollow';

const routes: Routes = [
  {
    path: '', 
    component: HomePageComponent, 
    pathMatch: 'full',
    canActivate: [homeGuard],
    data: {
      seo: {
        title: `${APP_NAME} | FIND IT. TRACK IT. SNAG IT`,
        description: GENERIC_SETTINGS.defaultDescription,
        robots: DEFAULT_ROBOTS
      }
    }
  },
  {
    path: 'featured', 
    component: HomePageComponent, 
    pathMatch: 'full',
    canActivate: [homeGuard],
    data: {
      featured: true,
      seo: {
        title: `${APP_NAME} | Featured Deals`,
        description: `Discover the best featured deals and exclusive offers on ${APP_NAME}.`,
        robots: DEFAULT_ROBOTS
      }
    }
  },
  {
    path: 'login', 
    component: LoginPageComponent, 
    pathMatch: 'full',
    canActivate: [publicGuard],
    data: {
      seo: {
        title: `${APP_NAME} | Login`,
        description: 'Access your personalised deal alerts, watchlists, and savings dashboard.',
        robots: DEFAULT_ROBOTS
      }
    }
  },
  {
    path: 'signup', 
    component: SignupPageComponent, 
    pathMatch: 'full',
    canActivate: [publicGuard],
    data: {
      seo: {
        title: `${APP_NAME} | Create a Free Account`,
        description: 'Sign up to set sale alerts, monitor price drops, and never miss a bargain again.',
        robots: DEFAULT_ROBOTS
      }
    }
  },
  {
    path: 'activation-confirmation', 
    component: ActivationConfirmationPageComponent, 
    pathMatch: 'full',
    canActivate: [ActivationConfirmationGuard],
    data: {
      seo: {
        title: `${APP_NAME} | Activation Confirmed`,
        description: 'Your account is active. Jump back into tracking the best offers across Australia.',
        robots: NOINDEX_ROBOTS
      }
    }
  },
  {
    path: 'verify-email', 
    component: AccountActivationPageComponent, 
    pathMatch: 'full',
    canActivate: [publicGuard],
    data: {
      seo: {
        title: `${APP_NAME} | Verify Your Email`,
        description: 'Enter your verification code to secure your account and unlock real-time deal alerts.',
        robots: NOINDEX_ROBOTS
      }
    }
  },
  {
    path: 'profile', 
    component: ProfilePageComponent, 
    pathMatch: 'full',
    canActivate: [authGuard],
    data: {
      seo: {
        title: `${APP_NAME} | Profile Settings`,
        description: 'Update your alert preferences, categories, and notification methods in one place.',
        robots: NOINDEX_ROBOTS
      }
    }
  },
  {
    path: 'upgrade', 
    component: UpgradePageComponent, 
    pathMatch: 'full',
    canActivate: [authGuard],
    data: {
      seo: {
        title: `${APP_NAME} | Upgrade Your Plan`,
        description: 'Compare premium features and unlock higher alert limits, faster deal tracking, and priority insights.',
        robots: NOINDEX_ROBOTS
      }
    }
  },
  {
    path: 'alerts', 
    component: AlertsPageComponent, 
    pathMatch: 'full',
    canActivate: [authGuard],
    data: {
      seo: {
        title: `${APP_NAME} | My Alerts`,
        description: 'Review, pause, or fine-tune every sale alert you have running inside Bargain Radar.',
        robots: NOINDEX_ROBOTS
      }
    }
  },
  {
    path: 'password-reset-confirm', 
    component: PasswordResetConfirmPageComponent, 
    pathMatch: 'full',
    canActivate: [publicGuard],
    data: {
      seo: {
        title: `${APP_NAME} | Confirm Password Reset`,
        description: 'Choose a new password to regain secure access to your Bargain Radar alerts.',
        robots: NOINDEX_ROBOTS
      }
    }
  },
  {
    path: 'forgot-password', 
    component: ForgotPasswordPageComponent, 
    pathMatch: 'full',
    canActivate: [publicGuard],
    data: {
      seo: {
        title: `${APP_NAME} | Forgot Password`,
        description: 'Request a secure reset link and get back to monitoring the deals that matter to you.',
        robots: NOINDEX_ROBOTS
      }
    }
  },
  {
    path: 'contact-us', 
    component: ContactUsPageComponent, 
    pathMatch: 'full',
    data: {
      seo: {
        title: `${APP_NAME} | Contact Us`,
        description: 'Get in touch with the Bargain Radar team for product support, partnerships, or press enquiries.',
        robots: DEFAULT_ROBOTS
      }
    }
  },
  {
    path: 'faq', 
    component: FaqPageComponent, 
    pathMatch: 'full',
    data: {
      seo: {
        title: `${APP_NAME} | FAQs`,
        description: 'Browse the most common questions about setting alerts, tracking items, and optimising your savings workflow.',
        robots: DEFAULT_ROBOTS
      }
    }
  },
  {
    path: 'about-us', 
    component: AboutUsPageComponent, 
    pathMatch: 'full',
    data: {
      seo: {
        title: `${APP_NAME} | About Us`,
        description: 'Discover why we built Bargain Radar, how we source deals, and the mission that guides every product decision.',
        robots: DEFAULT_ROBOTS
      }
    }
  },
  {
    path: 'item/:itemId', 
    component: ItemDetailsPageComponent, 
    pathMatch: 'full',
    data: {
      seo: {
        title: `${APP_NAME} | Item Insights`,
        description: 'Deep dive into price history, stock movement, and savings opportunities for individual products.',
        robots: DEFAULT_ROBOTS
      }
    }
  },
  {
    path: '**',
    component: NotFoundPageComponent,
    data: {
      seo: {
        title: `${APP_NAME} | Page Not Found`,
        description: `The page you requested could not be found on ${APP_NAME}.`,
        robots: NOINDEX_ROBOTS
      }
    }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
