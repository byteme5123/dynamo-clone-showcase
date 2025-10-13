import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Base URL - use the request origin or fall back to Supabase URL
    const baseUrl = new URL(req.url).origin.includes('localhost') 
      ? 'https://tvglfslhgmoimrbutnof.supabase.co'
      : new URL(req.url).origin;

    const urls: SitemapUrl[] = [];

    // Static pages with priorities
    const staticPages = [
      { path: '/', priority: 1.0, changefreq: 'daily' as const },
      { path: '/plans', priority: 0.9, changefreq: 'weekly' as const },
      { path: '/about', priority: 0.8, changefreq: 'monthly' as const },
      { path: '/contact', priority: 0.8, changefreq: 'monthly' as const },
      { path: '/wireless-pbx', priority: 0.8, changefreq: 'monthly' as const },
      { path: '/activate-sim', priority: 0.7, changefreq: 'monthly' as const },
    ];

    staticPages.forEach(page => {
      urls.push({
        loc: `${baseUrl}${page.path}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: page.changefreq,
        priority: page.priority,
      });
    });

    // Fetch active plans
    const { data: plans, error: plansError } = await supabase
      .from('plans')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('display_order');

    if (!plansError && plans) {
      plans.forEach(plan => {
        urls.push({
          loc: `${baseUrl}/plans/${plan.slug}`,
          lastmod: new Date(plan.updated_at).toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: 0.8,
        });
      });
    }

    // Fetch SEO settings pages (if any custom pages are defined)
    const { data: seoPages, error: seoError } = await supabase
      .from('seo_settings')
      .select('page_slug, updated_at');

    if (!seoError && seoPages) {
      const existingSlugs = new Set([...staticPages.map(p => p.path.slice(1)), ...plans.map(p => `plans/${p.slug}`)]);
      
      seoPages.forEach(page => {
        // Only add if not already in static pages or plans
        if (!existingSlugs.has(page.page_slug) && page.page_slug) {
          urls.push({
            loc: `${baseUrl}/${page.page_slug}`,
            lastmod: new Date(page.updated_at).toISOString().split('T')[0],
            changefreq: 'monthly',
            priority: 0.6,
          });
        }
      });
    }

    // Generate XML
    const xml = generateSitemapXML(urls);

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'X-Robots-Tag': 'noindex',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate sitemap' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateSitemapXML(urls: SitemapUrl[]): string {
  const urlEntries = urls.map(url => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority.toFixed(1)}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
</urlset>`;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
