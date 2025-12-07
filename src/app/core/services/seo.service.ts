import { Injectable, Inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { GENERIC_SETTINGS } from '../constants/generic-settings';

type StructuredData = Record<string, unknown>;

export interface SeoMetadata {
  title: string;
  description: string;
  keywords: string;
  robots: string;
  image: string;
  url: string;
  structuredData?: StructuredData | StructuredData[];
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly baseStructuredData: StructuredData[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: GENERIC_SETTINGS.app_name,
      url: GENERIC_SETTINGS.domain,
      logo: GENERIC_SETTINGS.socialImage,
      description: GENERIC_SETTINGS.defaultDescription
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: GENERIC_SETTINGS.app_name,
      url: GENERIC_SETTINGS.domain,
      description: GENERIC_SETTINGS.defaultDescription,
      applicationCategory: 'ShoppingApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'AUD'
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: GENERIC_SETTINGS.app_name,
      url: GENERIC_SETTINGS.domain,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${GENERIC_SETTINGS.domain}/?search={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    },
    ...[
      { name: 'Sign in', path: '/login' },
      { name: 'Sign up', path: '/signup' },
      { name: 'Contact us', path: '/contact-us' },
      { name: 'FAQ', path: '/faq' },
      { name: 'About', path: '/about-us' }
    ].map(link => ({
      '@context': 'https://schema.org',
      '@type': 'SiteNavigationElement',
      name: link.name,
      url: `${GENERIC_SETTINGS.domain}${link.path}`
    }))
  ];

  private readonly defaultSeo: SeoMetadata = {
    title: `${GENERIC_SETTINGS.app_name} - FIND IT. TRACK IT. SNAG IT`,
    description: GENERIC_SETTINGS.defaultDescription,
    keywords: GENERIC_SETTINGS.defaultKeywords,
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    image: GENERIC_SETTINGS.socialImage,
    url: GENERIC_SETTINGS.domain,
    structuredData: this.baseStructuredData
  };

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  update(seoOverrides?: Partial<SeoMetadata>): void {
    const seo = { ...this.defaultSeo, ...seoOverrides };
    const structuredData = [
      ...this.baseStructuredData,
      ...this.normalizeStructuredData(seoOverrides?.structuredData)
    ];

    this.title.setTitle(seo.title);
    this.meta.updateTag({ name: 'description', content: seo.description });
    this.meta.updateTag({ name: 'keywords', content: seo.keywords });
    this.meta.updateTag({ name: 'robots', content: seo.robots });
    this.meta.updateTag({ property: 'og:title', content: seo.title });
    this.meta.updateTag({ property: 'og:description', content: seo.description });
    this.meta.updateTag({ property: 'og:image', content: seo.image });
    this.meta.updateTag({ property: 'og:url', content: seo.url });
    this.meta.updateTag({ name: 'twitter:title', content: seo.title });
    this.meta.updateTag({ name: 'twitter:description', content: seo.description });
    this.meta.updateTag({ name: 'twitter:image', content: seo.image });
    this.meta.updateTag({ name: 'twitter:url', content: seo.url });

    this.setCanonicalUrl(seo.url);
    this.setStructuredData(structuredData);
  }

  private setCanonicalUrl(url: string): void {
    let linkElement = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!linkElement) {
      linkElement = this.document.createElement('link');
      linkElement.setAttribute('rel', 'canonical');
      this.document.head.appendChild(linkElement);
    }

    linkElement.setAttribute('href', url);
  }

  private setStructuredData(structuredData: StructuredData[]): void {
    this.document.querySelectorAll('script[data-seo-ld-json]').forEach(script => script.remove());

    structuredData.forEach((data, index) => {
      const script = this.document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-ld-json', `seo-${index}`);
      script.textContent = JSON.stringify(data);
      this.document.head.appendChild(script);
    });
  }

  private normalizeStructuredData(structuredData?: StructuredData | StructuredData[]): StructuredData[] {
    if (!structuredData) {
      return [];
    }

    return Array.isArray(structuredData) ? structuredData : [structuredData];
  }
}

