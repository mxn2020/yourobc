# Blog Feature - Quick Start Guide

Get your blog up and running in **5 minutes**! ⚡

## 🚀 Step 1: Environment Setup (1 min)

Add these to your `.env` file:

```env
# Required
VITE_PRIMARY_BLOG_PROVIDER=internal
VITE_SITE_URL=http://localhost:3000

# Optional (but recommended)
VITE_BLOG_ALLOW_COMMENTS=true
VITE_DEFAULT_OG_IMAGE=https://yoursite.com/og-image.png
```

## 📝 Step 2: Create Your First Post (3 min)

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the admin:**
   ```
   http://localhost:3000/admin/blog/posts/new
   ```

3. **Write your post:**
   - Enter a title (slug auto-generates!)
   - Write content in markdown
   - See live preview on the right
   - Watch your SEO score update in real-time

4. **Configure SEO (optional):**
   - Click the "SEO" tab
   - Add meta description
   - Add keywords
   - Follow the recommendations

5. **Click "Publish"!**

## 👀 Step 3: View Your Blog (1 min)

**Public Blog Homepage:**
```
http://localhost:3000/blog
```

**Your Published Post:**
```
http://localhost:3000/blog/your-post-slug
```

## ✅ That's It!

Your blog is now fully functional with:
- ✅ Markdown editing
- ✅ SEO optimization
- ✅ Comments (integrated!)
- ✅ Social sharing
- ✅ Responsive design
- ✅ Server-side rendering

---

## 🎯 Quick Tips

### Markdown Shortcuts
- `Ctrl + B` - Bold
- `Ctrl + I` - Italic
- `Ctrl + K` - Insert link
- `Ctrl + Alt + 1` - Heading 1

### View Modes
- **Write** - Focus on content
- **Split** - Write + Preview side-by-side
- **Preview** - See rendered output

### Auto-Features
- ✨ Slug auto-generates from title
- 💾 Auto-saves every 30 seconds
- 📊 SEO score updates in real-time
- ✅ Content validation on save

---

## 📚 Next Steps

### Create Multiple Posts
Just repeat Step 2! Each post gets its own unique slug.

### Organize with Categories
(Coming soon - for now, posts work great without categories!)

### Add Tags
In the post editor sidebar, add comma-separated tags:
```
tutorial, getting-started, react
```

### Moderate Comments
Comments are enabled by default. Users can comment on published posts!

---

## 🎨 Customize

### Change Posts Per Page
Edit `/src/features/system/blog/config/index.ts`:
```typescript
export const BLOG_CONFIG = {
  postsPerPage: 12, // Change this
  // ...
};
```

### Change Auto-Save Interval
```typescript
export const BLOG_CONFIG = {
  autoSaveInterval: 30000, // 30 seconds (in milliseconds)
  // ...
};
```

---

## 🐛 Troubleshooting

**Can't see the blog?**
- Make sure dev server is running: `npm run dev`
- Check the URL: `http://localhost:3000/blog`

**Can't publish a post?**
- Make sure title is at least 3 characters
- Make sure content is at least 100 characters
- Check browser console for errors

**SEO score is low?**
- Add more content (aim for 1000+ words)
- Fill in the SEO tab fields
- Follow the recommendations shown

---

## 💡 Pro Tips

1. **Write in markdown** - It's faster and cleaner
2. **Use the preview** - See exactly how it will look
3. **Save as draft first** - Perfect it before publishing
4. **Check SEO score** - Aim for 80+ for best results
5. **Add images** - Break up long text (upload coming soon!)

---

## 🎉 You're Ready!

Start blogging and watch your SEO score climb! 📈

For more details, see the [full README](./README.md).
