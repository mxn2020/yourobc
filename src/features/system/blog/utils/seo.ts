// src/features/system/blog/utils/seo.ts
/**
 * SEO Utilities
 *
 * Helpers for SEO optimization
 */

import type { BlogPost, SEOData, SEOScore, SEORecommendation } from '../types';
import { BLOG_CONFIG } from '../config';

/**
 * Calculate SEO score for a post (0-100)
 */
export function calculateSEOScore(post: {
  title: string;
  content: string;
  excerpt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  focusKeyword?: string;
  featuredImage?: { alt?: string };
}): SEOScore {
  let score = 0;
  const recommendations: SEORecommendation[] = [];

  // Title optimization (20 points)
  const title = post.seoTitle || post.title;
  const titleLength = title.length;

  if (titleLength >= BLOG_CONFIG.seoTitleMinLength && titleLength <= BLOG_CONFIG.seoTitleMaxLength) {
    score += 20;
  } else if (
    titleLength >= BLOG_CONFIG.seoTitleMinLength - 10 &&
    titleLength <= BLOG_CONFIG.seoTitleMaxLength + 10
  ) {
    score += 10;
    recommendations.push({
      type: 'title',
      severity: 'warning',
      message: `Title length should be between ${BLOG_CONFIG.seoTitleMinLength}-${BLOG_CONFIG.seoTitleMaxLength} characters`,
      currentValue: titleLength,
      recommendedValue: `${BLOG_CONFIG.seoTitleMinLength}-${BLOG_CONFIG.seoTitleMaxLength}`,
    });
  } else {
    recommendations.push({
      type: 'title',
      severity: 'critical',
      message: `Title length should be between ${BLOG_CONFIG.seoTitleMinLength}-${BLOG_CONFIG.seoTitleMaxLength} characters`,
      currentValue: titleLength,
      recommendedValue: `${BLOG_CONFIG.seoTitleMinLength}-${BLOG_CONFIG.seoTitleMaxLength}`,
    });
  }

  // Description optimization (20 points)
  const description = post.seoDescription || post.excerpt;
  if (description) {
    const descLength = description.length;

    if (
      descLength >= BLOG_CONFIG.seoDescriptionMinLength &&
      descLength <= BLOG_CONFIG.seoDescriptionMaxLength
    ) {
      score += 20;
    } else if (
      descLength >= BLOG_CONFIG.seoDescriptionMinLength - 10 &&
      descLength <= BLOG_CONFIG.seoDescriptionMaxLength + 20
    ) {
      score += 10;
      recommendations.push({
        type: 'description',
        severity: 'warning',
        message: `Description length should be between ${BLOG_CONFIG.seoDescriptionMinLength}-${BLOG_CONFIG.seoDescriptionMaxLength} characters`,
        currentValue: descLength,
        recommendedValue: `${BLOG_CONFIG.seoDescriptionMinLength}-${BLOG_CONFIG.seoDescriptionMaxLength}`,
      });
    } else {
      recommendations.push({
        type: 'description',
        severity: 'critical',
        message: `Description length should be between ${BLOG_CONFIG.seoDescriptionMinLength}-${BLOG_CONFIG.seoDescriptionMaxLength} characters`,
        currentValue: descLength,
        recommendedValue: `${BLOG_CONFIG.seoDescriptionMinLength}-${BLOG_CONFIG.seoDescriptionMaxLength}`,
      });
    }
  } else {
    recommendations.push({
      type: 'description',
      severity: 'critical',
      message: 'Meta description is missing',
    });
  }

  // Keywords optimization (20 points)
  if (post.seoKeywords && post.seoKeywords.length > 0) {
    score += 10;
    if (post.seoKeywords.length >= 3 && post.seoKeywords.length <= 8) {
      score += 10;
    } else {
      recommendations.push({
        type: 'keywords',
        severity: 'info',
        message: 'Recommended number of keywords is 3-8',
        currentValue: post.seoKeywords.length,
        recommendedValue: '3-8',
      });
    }
  } else {
    recommendations.push({
      type: 'keywords',
      severity: 'warning',
      message: 'Add SEO keywords to improve discoverability',
    });
  }

  // Content length (15 points)
  const wordCount = countWords(post.content);
  if (wordCount >= 1500) {
    score += 15;
  } else if (wordCount >= 1000) {
    score += 10;
    recommendations.push({
      type: 'content',
      severity: 'info',
      message: 'Content length is good, but 1500+ words is ideal',
      currentValue: wordCount,
      recommendedValue: '1500+',
    });
  } else if (wordCount >= 500) {
    score += 5;
    recommendations.push({
      type: 'content',
      severity: 'warning',
      message: 'Content is short. Aim for at least 1000 words',
      currentValue: wordCount,
      recommendedValue: '1000+',
    });
  } else {
    recommendations.push({
      type: 'content',
      severity: 'critical',
      message: 'Content is too short. Aim for at least 500 words',
      currentValue: wordCount,
      recommendedValue: '500+',
    });
  }

  // Focus keyword usage (15 points)
  if (post.focusKeyword) {
    const plainText = extractPlainText(post.content).toLowerCase();
    const keywordCount = (
      plainText.match(new RegExp(post.focusKeyword.toLowerCase(), 'g')) || []
    ).length;
    const density = keywordCount / wordCount;

    if (density >= 0.005 && density <= 0.03) {
      score += 15;
    } else if (keywordCount > 0) {
      score += 8;
      recommendations.push({
        type: 'keywords',
        severity: 'info',
        message: 'Focus keyword density should be 0.5-3%',
        currentValue: `${(density * 100).toFixed(2)}%`,
        recommendedValue: '0.5-3%',
      });
    } else {
      recommendations.push({
        type: 'keywords',
        severity: 'warning',
        message: 'Focus keyword not found in content',
      });
    }
  } else {
    recommendations.push({
      type: 'keywords',
      severity: 'info',
      message: 'Set a focus keyword to improve SEO targeting',
    });
  }

  // Image alt text (10 points)
  if (post.featuredImage?.alt && post.featuredImage.alt.length > 0) {
    score += 10;
  } else {
    recommendations.push({
      type: 'images',
      severity: 'warning',
      message: 'Add alt text to featured image for better accessibility and SEO',
    });
  }

  return {
    score: Math.min(score, 100),
    recommendations,
  };
}

/**
 * Extract plain text from markdown content
 */
function extractPlainText(content: string): string {
  return content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/!\[([^\]]*)]\([^)]+\)/g, '$1') // Remove markdown images
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1') // Remove markdown links
    .replace(/^#{1,6}\s+/gm, '') // Remove markdown headers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove markdown bold
    .replace(/\*([^*]+)\*/g, '$1') // Remove markdown italic
    .replace(/```[^`]*```/g, '') // Remove code blocks
    .replace(/`([^`]+)`/g, '$1') // Remove inline code
    .replace(/^>\s+/gm, '') // Remove blockquotes
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim();
}

/**
 * Count words in content
 */
function countWords(content: string): number {
  const plainText = extractPlainText(content);
  const words = plainText.split(/\s+/).filter((word) => word.length > 0);
  return words.length;
}

/**
 * Generate structured data (JSON-LD) for a blog post
 */
export function generateStructuredData(post: BlogPost, siteUrl: string): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    image: post.featuredImage?.url,
    author: {
      '@type': 'Person',
      name: post.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Your Site Name', // TODO: Make configurable
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`, // TODO: Make configurable
      },
    },
    datePublished: post.publishedAt !== undefined ? new Date(post.publishedAt).toISOString() : undefined,
    dateModified: post.updatedAt !== undefined ? new Date(post.updatedAt).toISOString() : undefined,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${post.slug}`,
    },
  };
}

/**
 * Generate meta tags for a blog post
 */
export function generateMetaTags(post: BlogPost, siteUrl: string): SEOData {
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt || '';
  const keywords = post.seoKeywords || [];
  const ogImage = post.featuredImage?.url || '';
  const canonical = `${siteUrl}/blog/${post.slug}`;

  return {
    title,
    description,
    keywords,
    focusKeyword: post.focusKeyword,
    ogImage,
    ogImageAlt: post.featuredImage?.alt,
    canonical,
    structuredData: generateStructuredData(post, siteUrl),
  };
}

/**
 * Generate social share URLs
 */
export function generateShareUrls(post: BlogPost, siteUrl: string) {
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const encodedUrl = encodeURIComponent(postUrl);
  const encodedTitle = encodeURIComponent(post.title);
  const encodedText = post.excerpt ? encodeURIComponent(post.excerpt) : encodedTitle;

  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`,
  };
}
