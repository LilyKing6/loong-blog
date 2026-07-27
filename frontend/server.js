const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const { renderMarkdown } = require('./public/md');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const BLOG_API_URL = process.env.BLOG_API_URL || 'http://localhost:8080/api/blog';
const DOCS_API_URL = process.env.DOCS_API_URL || 'http://localhost:8080/api/docs';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

async function api(endpoint) {
  const res = await fetch(BLOG_API_URL + endpoint);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

async function docsApi(endpoint) {
  const res = await fetch(DOCS_API_URL + endpoint);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

function formatDate(d) {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); }
  catch { return d; }
}

function excerpt(body, max = 200) {
  if (!body) return '';
  const t = body.replace(/#{1,6}\s+/g, '').replace(/[*_~`]/g, '').replace(/\n{2,}/g, ' ').replace(/\n/g, ' ').trim();
  return t.length > max ? t.slice(0, max) + '...' : t;
}

async function resolveTags(posts) {
  let tags = [];
  try { const td = await api('/tags'); tags = td.tags || []; } catch {}
  return posts.map(p => ({ ...p, tags: (p.tagIds || []).map(tid => tags.find(t => t.id === tid)).filter(Boolean) }));
}


// ===== Admin Auth =====
async function getCurrentUser(req) {
  const token = req.cookies.loong_session;
  if (!token) return null;
  try {
    const res = await fetch(BLOG_API_URL.replace('/api/blog', '') + '/api/auth/me', {
      headers: { Cookie: 'loong_session=' + token }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

function requireAdmin(req, res, next) {
  if (!req.cookies.loong_session) return res.redirect('/admin/login');
  next();
}

// ===== Blog Routes =====

app.get('/', async (req, res) => {
  try {
    const [postsData, catsData, tagsData] = await Promise.all([
      api('/posts?status=published'), api('/categories'), api('/tags')
    ]);
    res.render('home', {
      posts: await resolveTags((postsData.posts || []).slice(0, 5)),
      categories: catsData.categories || [], tags: tagsData.tags || [],
      active: 'home', title: 'Loong Blog — A blog built on Loong',
      description: 'Writing, sharing, and documenting — all powered by a Loong web server.',
      formatDate, excerpt, renderMarkdown, error: null
    });
  } catch (e) {
    res.render('home', { posts: [], categories: [], tags: [], active: 'home', formatDate, excerpt, renderMarkdown, error: e.message });
  }
});

app.get('/posts', async (req, res) => {
  try {
    const { status, category, tag } = req.query;
    let data, label;
    if (category) {
      data = await api('/posts/by-category?slug=' + encodeURIComponent(category)); label = 'Category: ' + category;
    } else if (tag) {
      data = await api('/posts/by-tag?slug=' + encodeURIComponent(tag)); label = 'Tag: ' + tag;
    } else {
      data = await api('/posts?status=' + (status || 'all')); label = 'All Posts';
    }
    res.render('posts', { posts: await resolveTags(data.posts || []), filterLabel: label, active: 'posts', formatDate, excerpt, renderMarkdown, error: null });
  } catch (e) {
    res.render('posts', { posts: [], filterLabel: 'Error', active: 'posts', formatDate, excerpt, renderMarkdown, error: e.message });
  }
});

app.get('/post', async (req, res) => {
  try {
    const [pd, cd] = await Promise.all([api('/post?slug=' + req.query.slug), api('/posts/comments?slug=' + req.query.slug)]);
    const post = pd.post || pd;
    const td = await api('/tags').catch(() => ({ tags: [] }));
    post.tags = (post.tagIds || []).map(tid => (td.tags || []).find(t => t.id === tid)).filter(Boolean);
    let catName = ''; try { const c = await api('/categories'); catName = ((c.categories || []).find(c => c.id === post.categoryId) || {}).name || ''; } catch {}
    res.render('post', { post, comments: cd.comments || [], categoryName: catName, active: 'posts', formatDate, excerpt, renderMarkdown, error: null });
  } catch (e) {
    res.render('error', { code: 404, message: e.message, formatDate });
  }
});

app.get('/categories', async (req, res) => {
  try {
    const [cd, td] = await Promise.all([api('/categories'), api('/tags')]);
    res.render('categories', { categories: cd.categories || [], tags: td.tags || [], active: 'categories', formatDate, excerpt, renderMarkdown, error: null });
  } catch (e) {
    res.render('categories', { categories: [], tags: [], active: 'categories', formatDate, excerpt, renderMarkdown, error: e.message });
  }
});

app.get('/tags', async (req, res) => {
  try {
    const td = await api('/tags');
    res.render('tags', { tags: td.tags || [], active: 'tags', formatDate, excerpt, renderMarkdown, error: null });
  } catch (e) {
    res.render('tags', { tags: [], active: 'tags', formatDate, excerpt, renderMarkdown, error: e.message });
  }
});

app.get('/search', async (req, res) => {
  const q = req.query.q || '';
  try {
    const sd = q ? await api('/posts/search?q=' + encodeURIComponent(q)) : { posts: [], count: 0 };
    res.render('search', { q, posts: sd.posts || [], count: sd.count || 0, active: 'search', formatDate, excerpt, renderMarkdown, error: null });
  } catch (e) {
    res.render('search', { q, posts: [], count: 0, active: 'search', formatDate, excerpt, renderMarkdown, error: e.message });
  }
});

app.post('/post/:slug/comment', async (req, res) => {
  try {
    await fetch(BLOG_API_URL + '/posts/comments?slug=' + req.params.slug, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ authorName: req.body.author || 'Anonymous', body: req.body.body || '' }).toString()
    });
  } catch {}
  res.redirect('/post?slug=' + req.params.slug);
});

// ===== Docs Routes =====

app.get('/docs', async (req, res) => {
  try {
    const [hd, vd, nd] = await Promise.all([docsApi('/'), docsApi('/versions'), docsApi('/nav')]);
    res.render('docs/home', {
      title: hd.title || 'Loong Docs', versionCount: hd.versionCount || 0, pageCount: hd.pageCount || 0,
      versions: vd.versions || [], navNodes: nd.navNodes || [],
      active: 'docs', formatDate, excerpt, renderMarkdown, error: null
    });
  } catch (e) {
    res.render('docs/home', { title: 'Loong Docs', versionCount: 0, pageCount: 0, versions: [], navNodes: [], active: 'docs', formatDate, excerpt, renderMarkdown, error: e.message });
  }
});

app.get('/docs/:version', async (req, res) => {
  try {
    const [vd, nd] = await Promise.all([
      docsApi('/version?name=' + encodeURIComponent(req.params.version)),
      docsApi('/nav?version=' + encodeURIComponent(req.params.version))
    ]);
    res.render('docs/version', {
      versionName: req.params.version, version: vd.version || {},
      pages: vd.pages || [], navNodes: nd.navNodes || vd.navNodes || [],
      active: 'docs', formatDate, excerpt, renderMarkdown, error: null
    });
  } catch (e) {
    res.render('docs/version', { versionName: req.params.version, version: {}, pages: [], navNodes: [], active: 'docs', formatDate, excerpt, renderMarkdown, error: e.message });
  }
});

app.get('/docs/:version/:slug', async (req, res) => {
  try {
    const [pd, nd] = await Promise.all([
      docsApi('/page?slug=' + encodeURIComponent(req.params.slug)),
      docsApi('/nav?version=' + encodeURIComponent(req.params.version))
    ]);
    res.render('docs/page', {
      versionName: req.params.version, page: pd,
      html: pd.body ? renderMarkdown(pd.body) : '',
      navNodes: nd.navNodes || [],
      active: 'docs', formatDate, excerpt, renderMarkdown, error: null
    });
  } catch (e) {
    res.render('docs/page', { versionName: req.params.version, page: {}, html: '', navNodes: [], active: 'docs', formatDate, excerpt, renderMarkdown, error: e.message });
  }
});

app.get('/docs/search', async (req, res) => {
  const q = req.query.q || '';
  try {
    const sd = q ? await docsApi('/pages/search?q=' + encodeURIComponent(q)) : { pages: [], count: 0 };
    res.render('docs/search', { q, pages: sd.pages || [], count: sd.count || 0, active: 'docs', formatDate, excerpt, renderMarkdown, error: null });
  } catch (e) {
    res.render('docs/search', { q, pages: [], count: 0, active: 'docs', formatDate, excerpt, renderMarkdown, error: e.message });
  }
});


// ===== Admin Routes =====

// Login page
app.get('/admin/login', (req, res) => {
  res.render('admin/login', { error: null, layout: false });
});

// Login submit — proxy to blog backend, capture Set-Cookie
app.post('/admin/login', async (req, res) => {
  try {
    const resp = await fetch(BLOG_API_URL.replace('/api/blog', '') + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ user: req.body.username || 'admin' }).toString()
    });
    if (!resp.ok) throw new Error('Login failed');
    // Extract Set-Cookie header
    const setCookie = resp.headers.get('set-cookie') || '';
    const match = setCookie.match(/loong_session=([^;]+)/);
    const token = match ? match[1] : 'demo-' + (req.body.username || 'admin');
    res.cookie('loong_session', token, { httpOnly: true, maxAge: 86400000 });
    res.redirect('/admin');
  } catch (e) {
    res.render('admin/login', { error: e.message, layout: false });
  }
});

// Logout
app.get('/admin/logout', (req, res) => {
  res.clearCookie('loong_session');
  res.redirect('/admin/login');
});

// Admin dashboard
app.get('/admin', requireAdmin, async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    const [pd, cd, td] = await Promise.all([
      api('/posts?status=all'), api('/categories'), api('/tags')
    ]);
    res.render('admin/dashboard', {
      user, posts: pd.posts || [], categories: cd.categories || [], tags: td.tags || [],
      active: 'dashboard', formatDate, excerpt, renderMarkdown, layout: 'admin/layout', error: null
    });
  } catch (e) {
    res.render('admin/dashboard', { user: null, posts: [], categories: [], tags: [], active: 'dashboard', formatDate, excerpt, renderMarkdown, layout: 'admin/layout', error: e.message });
  }
});

// Admin posts list
app.get('/admin/posts', requireAdmin, async (req, res) => {
  try {
    const pd = await api('/posts?status=all');
    res.render('admin/posts', { posts: pd.posts || [], active: 'posts', formatDate, excerpt, renderMarkdown, layout: 'admin/layout', error: null });
  } catch (e) {
    res.render('admin/posts', { posts: [], active: 'posts', formatDate, excerpt, renderMarkdown, layout: 'admin/layout', error: e.message });
  }
});

// Admin new post
app.get('/admin/posts/new', requireAdmin, async (req, res) => {
  try {
    const [cd, td] = await Promise.all([api('/categories'), api('/tags')]);
    res.render('admin/editor', {
      post: null, categories: cd.categories || [], tags: td.tags || [],
      active: 'posts', formatDate, excerpt, renderMarkdown, layout: 'admin/layout', error: null
    });
  } catch (e) {
    res.render('admin/editor', { post: null, categories: [], tags: [], active: 'posts', formatDate, excerpt, renderMarkdown, layout: 'admin/layout', error: e.message });
  }
});

// Admin edit post
app.get('/admin/posts/:slug/edit', requireAdmin, async (req, res) => {
  try {
    const [pd, cd, td] = await Promise.all([
      api('/post?slug=' + encodeURIComponent(req.params.slug)),
      api('/categories'), api('/tags')
    ]);
    const post = pd.post || pd;
    res.render('admin/editor', {
      post, categories: cd.categories || [], tags: td.tags || [],
      active: 'posts', formatDate, excerpt, renderMarkdown, layout: 'admin/layout', error: null
    });
  } catch (e) {
    res.render('admin/editor', { post: null, categories: [], tags: [], active: 'posts', formatDate, excerpt, renderMarkdown, layout: 'admin/layout', error: e.message });
  }
});

// Admin create/update post
app.post('/admin/posts/save', requireAdmin, async (req, res) => {
  const token = req.cookies.loong_session;
  const { slug, title, body, status, categoryId, existingSlug } = req.body;
  try {
    if (existingSlug) {
      await fetch(BLOG_API_URL + '/posts?slug=' + encodeURIComponent(existingSlug), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: 'loong_session=' + token },
        body: new URLSearchParams({ title, body, status: status || 'draft', newSlug: slug, categoryId: categoryId || '0' }).toString()
      });
    } else {
      await fetch(BLOG_API_URL + '/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: 'loong_session=' + token },
        body: new URLSearchParams({ title, body, slug, status: status || 'draft', categoryId: categoryId || '0' }).toString()
      });
    }
    res.redirect('/admin/posts');
  } catch (e) {
    res.redirect('/admin/posts');
  }
});

// Admin delete post
app.post('/admin/posts/:slug/delete', requireAdmin, async (req, res) => {
  const token = req.cookies.loong_session;
  try {
    await fetch(BLOG_API_URL + '/posts?slug=' + encodeURIComponent(req.params.slug), {
      method: 'DELETE',
      headers: { Cookie: 'loong_session=' + token }
    });
  } catch {}
  res.redirect('/admin/posts');
});

// Admin categories
app.get('/admin/categories', requireAdmin, async (req, res) => {
  try {
    const cd = await api('/categories');
    res.render('admin/categories', { categories: cd.categories || [], active: 'categories', formatDate, excerpt, renderMarkdown, layout: 'admin/layout', error: null });
  } catch (e) {
    res.render('admin/categories', { categories: [], active: 'categories', formatDate, excerpt, renderMarkdown, layout: 'admin/layout', error: e.message });
  }
});

// Admin create category
app.post('/admin/categories/create', requireAdmin, async (req, res) => {
  const token = req.cookies.loong_session;
  try {
    await fetch(BLOG_API_URL + '/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: 'loong_session=' + token },
      body: new URLSearchParams({ slug: req.body.slug, name: req.body.name }).toString()
    });
  } catch {}
  res.redirect('/admin/categories');
});

// Admin tags
app.get('/admin/tags', requireAdmin, async (req, res) => {
  try {
    const td = await api('/tags');
    res.render('admin/tags', { tags: td.tags || [], active: 'tags', formatDate, excerpt, renderMarkdown, layout: 'admin/layout', error: null });
  } catch (e) {
    res.render('admin/tags', { tags: [], active: 'tags', formatDate, excerpt, renderMarkdown, layout: 'admin/layout', error: e.message });
  }
});

// Admin create tag
app.post('/admin/tags/create', requireAdmin, async (req, res) => {
  const token = req.cookies.loong_session;
  try {
    await fetch(BLOG_API_URL + '/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: 'loong_session=' + token },
      body: new URLSearchParams({ slug: req.body.slug, name: req.body.name }).toString()
    });
  } catch {}
  res.redirect('/admin/tags');
});



// ===== RSS Feed =====
app.get('/feed.xml', async (req, res) => {
  try {
    const pd = await api('/posts?status=published');
    const posts = pd.posts || [];
    const baseUrl = 'http://localhost:' + PORT;
    let items = posts.map(p => {
      const link = baseUrl + '/post?slug=' + encodeURIComponent(p.slug);
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="false">${p.slug}</guid>
      <pubDate>${p.publishedAt ? new Date(p.publishedAt).toUTCString() : new Date().toUTCString()}</pubDate>
      <description>${escapeXml(excerpt(p.body, 300))}</description>
    </item>`;
    }).join('\n');
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Loong Blog</title>
    <link>${baseUrl}</link>
    <description>A blog built on the Loong Web Framework</description>
    <language>en</language>
${items}
  </channel>
</rss>`;
    res.set('Content-Type', 'application/rss+xml');
    res.send(xml);
  } catch (e) {
    res.set('Content-Type', 'application/rss+xml');
    res.send('<?xml version="1.0"?><rss version="2.0"><channel><title>Loong Blog</title></channel></rss>');
  }
});

function escapeXml(s) {
  return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
}

// ===== Sitemap =====
app.get('/sitemap.xml', async (req, res) => {
  try {
    const [pd, cd, td] = await Promise.all([api('/posts?status=all'), api('/categories'), api('/tags')]);
    const baseUrl = 'http://localhost:' + PORT;
    let urls = ['<url><loc>' + baseUrl + '/</loc></url>', '<url><loc>' + baseUrl + '/posts</loc></url>', '<url><loc>' + baseUrl + '/categories</loc></url>', '<url><loc>' + baseUrl + '/tags</loc></url>', '<url><loc>' + baseUrl + '/docs</loc></url>'];
    (pd.posts || []).forEach(p => urls.push('<url><loc>' + baseUrl + '/post?slug=' + encodeURIComponent(p.slug) + '</loc></url>'));
    (cd.categories || []).forEach(c => urls.push('<url><loc>' + baseUrl + '/posts?category=' + encodeURIComponent(c.slug) + '</loc></url>'));
    (td.tags || []).forEach(t => urls.push('<url><loc>' + baseUrl + '/posts?tag=' + encodeURIComponent(t.slug) + '</loc></url>'));
    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.join('\n') + '\n</urlset>';
    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (e) {
    res.set('Content-Type', 'application/xml');
    res.send('<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
  }
});

// ===== 404 =====

app.use((req, res) => {
  res.render('error', { code: 404, message: 'Page not found', formatDate });
});

app.listen(PORT, () => {
  console.log(`Loong Blog frontend running at http://localhost:${PORT}`);
  console.log(`Blog API: ${BLOG_API_URL}`);
  console.log(`Docs API: ${DOCS_API_URL}`);
});
