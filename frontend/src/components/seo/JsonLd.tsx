export default function JsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Threads Clone",
    description:
      "A modern social media platform for sharing thoughts, connecting with friends, and discovering trending content.",
    url: "https://threads-clone-three-nu.vercel.app",
    applicationCategory: "SocialNetworkingApplication",
    operatingSystem: "Web",
    author: {
      "@type": "Person",
      name: "Shahadot Hossain",
      url: "https://github.com/shahadot786",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      ratingCount: "1",
    },
    featureList: [
      "Create and share posts",
      "Follow users",
      "Like and comment on posts",
      "Search users and posts",
      "Trending hashtags",
      "Real-time notifications",
      "Dark mode support",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
