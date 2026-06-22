// Reusable SEO component type (matches Strapi SEO plugin)
export interface StrapiSEO {
    metaTitle: string;
    metaDescription: string;
    keywords?: string;
    canonicalUrl?: string;
    metaImage?: {
        data: {
            attributes: {
                url: string;
                width: number;
                height: number;
            };
        };
    };
    structuredData?: Record<string, unknown>;
}

export interface CoverType {
    // data?: {
    id: number;
    name: string;
    alternativeText: string | null;
    caption: string | null;
    width: number;
    height: number;
    formats: {
        large: ImageFormatType;
        small: ImageFormatType;
        medium: ImageFormatType;
        thumbnail: ImageFormatType;
    };
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl: string | null;
    provider: string;
    provider_metadata: {
        public_id: string;
        resource_type: string;
    };
    createdAt: string;
    updatedAt: string;
    // attributes: {

    // };
    // };
};
type ImageFormatType = {
    ext: string;
    url: string;
    hash: string;
    mime: string;
    name: string;
    path: string | null;
    size: number;
    width: number;
    height: number;
    provider_metadata: {
        public_id: string;
        resource_type: string;
    };
};

export interface StrapiAttributes {
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    locale: string;
    seo?: StrapiSEO;
}

export interface WhatYouGetItem {
    id: number;
    title: string;
    description: string;
}

export interface MediaItem {
    id: number;
    title: string;
    description: string;
    image: CoverType;
}

export interface KPIS {
    id: number;
    title: string;
    number: string;
    suffix: string;
}
export interface CriticalProjects {
    id: number;
    name: string;
    image: CoverType;
}
export interface GlobalSettingAttributes {
    phone: string;
    email: string;
    address_en: string;
    address_ar: string;
    address_link: string;
}
// Example: Homepage (single type)
export interface HomePageAttributes extends StrapiAttributes {
    hero_headline: string;
    hero_subheadline: string;
    image: CoverType | null;
    partner_headline: string;
    partner_subheadline: string;
    partner_image: CoverType | null;
    section1_title: string;
    section1_desc: string;
    section1_cta: string;
    section1_image: CoverType | null;

    section2_title: string;
    intro_what_you_get: WhatYouGetItem[];
    section3_title: string;
    intro_why_choose_us: WhatYouGetItem[];
    section4_title: string;
    section4_desc: string;
    section4_cta: string;
    section4_checklist_label: string;
    section4_checklist_link: string;
    section4_image: CoverType | null;
    section5_subheading: string;
    section5_heading: string;
    section5_desc: string;
    approach_steps: WhatYouGetItem[];

    where_we_operate: string;
    where_we_operate_heading: string;
    where_we_operate_subheading: string;
    where_we_operate_body: string;
    kpis: KPIS[];

    project_title: string;
    critical_projects: CriticalProjects[];

    services_entry_heading: string;
    services_entry_items: MediaItem[];
    testimonials_title: string;
    testimonials: WhatYouGetItem[];

    inquiry_cta_heading: string;
    inquiry_cta_body: string;
    // seo: StrapiSEO;
}

export interface CriticalEnvironments extends StrapiAttributes {
    id: number;
    slug: string;
    name: string;
    industry: string;
    cover: CoverType;
    content: string;
}

export interface TeamMember{
    id: number;
    name: string;
    position: string;
    profile: CoverType;
}
export interface OurJourneyAttributes extends StrapiAttributes {
    hero_headline: string;
    image: CoverType | null;
    section1_title: string;
    section1_desc: string;
    section1_image: CoverType | null;
    section2_title: string;
    section2_desc: string;
    section2_image: CoverType | null;

    section3_title: string;
    section3_desc: string;
    // critical_environments: CriticalEnvironments[];

    section4_desc: string;
    section4_image: CoverType | null;

    section5_leadership: string;
    section5_heading: string;
    section5_subheading: string;
    section5_body: string;
    team_members: TeamMember[]
}
// Example: Blog post (collection type)
// export interface PostAttributes extends StrapiAttributes {
//     title: string;
//     slug: string;
//     content: string;
//     seo: StrapiSEO;
// }