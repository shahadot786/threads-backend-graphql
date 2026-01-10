import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://threads-clone-three-nu.vercel.app/";

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/search/`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/activity/`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login/`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register/`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/forgot-password/`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
  ];

  // In the future, you could fetch dynamic pages from the API:
  // - Popular user profiles: /users/popular
  // - Trending hashtags: /tags/trending
  // - Popular posts: /posts/trending

  return staticPages;
}
