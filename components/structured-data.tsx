export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'WhisTrust',
    url: 'https://whistrust.com',
    logo: 'https://whistrust.com/icon.svg',
    description: 'Secure anonymous whistleblowing and ethics reporting platform',
    foundingDate: '2024',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@whistrust.com',
    },
    sameAs: [
      // Add your social media URLs here when available
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function SoftwareApplicationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'WhisTrust',
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Compliance Management Software',
    operatingSystem: 'Web',
    offers: [
      {
        '@type': 'Offer',
        name: 'Free Plan',
        price: '0',
        priceCurrency: 'USD',
        description: 'Up to 2 reports per month with basic tracking',
      },
      {
        '@type': 'Offer',
        name: 'Starter Plan',
        price: '29',
        priceCurrency: 'USD',
        description: 'Up to 100 reports per month with case assignment and audit logs',
      },
      {
        '@type': 'Offer',
        name: 'Pro Plan',
        price: '59',
        priceCurrency: 'USD',
        description: 'Unlimited reports with encrypted messaging and analytics',
      },
      {
        '@type': 'Offer',
        name: 'Business Plan',
        price: '99',
        priceCurrency: 'USD',
        description: 'Advanced RBAC, SSO, and priority support',
      },
    ],
    description: 'Secure anonymous whistleblowing and ethics reporting platform with enterprise-grade security',
    featureList: [
      'Anonymous Reporting',
      'End-to-End Encryption',
      'Role-Based Access Control',
      'Real-time Messaging',
      'Audit Logging',
      'File Attachments',
      'Case Management',
      'Analytics Dashboard',
      'Compliance Ready',
    ],
    screenshot: 'https://whistrust.com/og-image.png',
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function FAQSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is my data encrypted?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absolutely. All data is encrypted in transit and at rest using industry-standard AES encryption. Messages use client-side encryption for maximum security.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I upgrade or downgrade anytime?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we will prorate any charges for the billing cycle.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you offer NGO or educational discounts?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, we offer special pricing for NGOs, educational institutions, and non-profit organizations. Contact our sales team for details.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does WhisTrust compare to other providers?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'WhisTrust offers enterprise-grade security at a fraction of the cost. We provide unlimited reports, advanced encryption, metadata cleaning, real-time messaging, and comprehensive audit logging at transparent, affordable pricing with data localization options.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is anonymous reporting truly anonymous?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. WhisTrust uses tracking codes instead of personal information. We automatically remove metadata from uploaded files and implement end-to-end encryption for all communications.',
        },
      },
      {
        '@type': 'Question',
        name: 'What types of reports can be submitted?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'WhisTrust supports multiple report categories including fraud, harassment, safety violations, policy violations, discrimination, conflicts of interest, and ethical concerns.',
        },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'WhisTrust',
    url: 'https://whistrust.com',
    description: 'Secure anonymous whistleblowing and ethics reporting platform',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://whistrust.com/track?code={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function BreadcrumbSchema({ items }: { items: Array<{ name: string; url: string }> }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

