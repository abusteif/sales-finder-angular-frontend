import { Injectable, Inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { GENERIC_SETTINGS } from '../constants/generic-settings';

export interface SeoMetadata {
  title: string;
  description: string;
  keywords: string;
  robots: string;
  image: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly defaultSeo: SeoMetadata = {
    title: `${GENERIC_SETTINGS.app_name} - FIND IT. TRACK IT. SNAG IT`,
    description: GENERIC_SETTINGS.defaultDescription,
    keywords: GENERIC_SETTINGS.defaultKeywords,
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    image: GENERIC_SETTINGS.socialImage,
    url: GENERIC_SETTINGS.domain
  };

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  update(seoOverrides?: Partial<SeoMetadata>): void {
    const seo = { ...this.defaultSeo, ...seoOverrides };

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
}

