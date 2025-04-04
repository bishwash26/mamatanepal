import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  schema?: object;
}

const SEO: React.FC<SEOProps> = ({
  title = '',
  description = 'Complete pregnancy and motherhood resource with expert advice, community discussions, and curated products for every stage of your journey.',
  keywords = 'pregnancy, motherhood, baby care, maternity, prenatal, postnatal, baby products, maternal health, breastfeeding, parenting',
  image = '/hero-mother.jpg',
  url = '',
  type = 'website',
  schema,
}) => {
  const siteTitle = title 
    ? `${title} | Mamata Nepal` 
    : 'Mamata Nepal - Supporting Mothers Through Pregnancy and Beyond';
  
  const currentUrl = url 
    ? `https://mamata-nepal.com${url}` 
    : 'https://mamata-nepal.com';

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="title" content={siteTitle} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image.startsWith('http') ? image : `https://mamata-nepal.com${image}`} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={currentUrl} />
      <meta property="twitter:title" content={siteTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image.startsWith('http') ? image : `https://mamata-nepal.com${image}`} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />
      
      {/* Schema.org structured data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO; 