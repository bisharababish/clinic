import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  structuredData?: object;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'Bethlehem Medical Center - Premier Healthcare Services in Palestine',
  description = 'Bethlehem Medical Center offers comprehensive healthcare services including general medicine, laboratory testing, X-ray imaging, and specialized medical care in Bethlehem, Palestine.',
  keywords = 'Bethlehem Medical Center, healthcare Palestine, medical services Bethlehem, doctor appointments, lab tests, X-ray imaging',
  image = 'https://bethlehemmedcenter.com/favicon.svg',
  url = 'https://bethlehemmedcenter.com',
  type = 'website',
  structuredData
}) => {
  const fullTitle = title.includes('Bethlehem Medical Center') 
    ? title 
    : `${title} | Bethlehem Medical Center`;

  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    "name": "Bethlehem Medical Center",
    "url": url,
    "description": description,
    "image": image,
    "telephone": "+970-2-XXX-XXXX",
    "email": "info@bethlehemmedcenter.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Main Street",
      "addressLocality": "Bethlehem",
      "addressRegion": "West Bank",
      "addressCountry": "PS"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "31.7054",
      "longitude": "35.2024"
    },
    "openingHours": [
      "Mo-Fr 08:00-18:00",
      "Sa 08:00-14:00"
    ]
  };

  const finalStructuredData = structuredData || defaultStructuredData;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Bethlehem Medical Center" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>
    </Helmet>
  );
};

export default SEOHead;
