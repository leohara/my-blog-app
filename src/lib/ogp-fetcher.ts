import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export interface OGPData {
  title: string;
  description: string;
  image?: string;
  siteName?: string;
  url: string;
}

export async function fetchOGPData(url: string): Promise<OGPData | null> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const ogpData: OGPData = {
      title: $('meta[property="og:title"]').attr('content') ||
             $('title').text() || url,
      description: $('meta[property="og:description"]').attr('content') ||
                   $('meta[name="description"]').attr('content') || '',
      image: $('meta[property="og:image"]').attr('content'),
      siteName: $('meta[property="og:site_name"]').attr('content'),
      url: url
    };

    return ogpData;
  } catch (error) {
    console.error(`Failed to fetch OGP data for ${url}:`, error);
    return null;
  }
}