export default function JsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FinancialApplication',
    name: 'Aura Moni',
    operatingSystem: 'Web, Android, iOS',
    applicationCategory: 'FinanceApplication',
    description: 'Aura Moni giúp bạn quản lý tài chính cá nhân dễ dàng với AI, theo dõi chi tiêu, lập ngân sách và báo cáo trực quan.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'VND',
    },
    author: {
      '@type': 'Organization',
      name: 'Aura Moni',
      url: 'https://finance-flame-delta.vercel.app/',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
