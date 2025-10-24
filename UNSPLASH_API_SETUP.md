# Unsplash API Setup (Optional)

## Overview

To enable automatic image search and embedding in PowerPoint presentations, you need an Unsplash API key.

## Why Unsplash?

✅ **Free Tier**: 50 requests/hour
✅ **High Quality**: Professional, royalty-free images
✅ **No Attribution Required**: In PowerPoint presentations
✅ **Massive Library**: Over 3 million photos
✅ **API-Friendly**: Simple REST API

## Setup Instructions

### Step 1: Create Unsplash Account

1. Go to https://unsplash.com/
2. Click "Sign up" (or "Join" in top-right)
3. Sign up with email or Google account
4. Verify your email address

### Step 2: Register as Developer

1. Go to https://unsplash.com/developers
2. Click "Register as a developer"
3. Accept the API Terms of Use
4. You'll be redirected to your developer dashboard

### Step 3: Create Application

1. In your developer dashboard, click "New Application"
2. Fill out the form:
   - **Application name**: `Digital Transformation Assessment Generator`
   - **Description**: `Generates PowerPoint presentations with industry-relevant imagery for digital transformation assessments`
3. Check the boxes:
   - ✅ I have read and agree to the API Use and Guidelines
   - ✅ I acknowledge the Unsplash API is for demonstration purposes only
4. Click "Create application"

### Step 4: Get Your Access Key

1. You'll see your new application page
2. Find the section **"Keys"**
3. Copy your **Access Key** (starts with a long random string)
4. Do NOT share your **Secret Key** (we don't need it for this use case)

### Step 5: Add to Environment Variables

1. Open your `.env.local` file in the project root:
   ```bash
   cd "C:\Dev New\personal-website-nextjs"
   notepad .env.local
   ```

2. Add this line:
   ```env
   UNSPLASH_ACCESS_KEY=your_access_key_here
   ```

3. Save the file

### Step 6: Restart Your Dev Server

If your dev server is running:
```bash
# Stop the server (Ctrl+C)
# Restart it
npm run dev
```

## Testing

Test that images are working:

```bash
# Generate a presentation
curl "http://localhost:3002/api/assessment/{ASSESSMENT_ID}/export-pptx-enhanced" \
  --output test.pptx

# Check the console logs - you should see:
# [PPTX Export] Searching for image: data analytics dashboard visualization
# [PPTX Export] Image found for data_strategy
```

## Rate Limits

### Demo (Free) Tier
- **50 requests per hour**
- Perfect for testing and small-scale use
- Resets every hour

### Production Tier
If you need more:
1. Apply for Production access in your Unsplash dashboard
2. Provide details about your application usage
3. Get approved for **5,000 requests per hour**

## Troubleshooting

### Issue: "Unsplash API key not configured"

**Fix**: Add `UNSPLASH_ACCESS_KEY` to `.env.local` and restart server

### Issue: "Rate limit exceeded"

**Fix**: Wait for the hour to reset, or apply for Production tier

### Issue: Images not appearing in PowerPoint

**Check**:
1. Console logs show "Image found for [slide_type]"
2. No errors in the API response
3. .pptx file size is larger (images add ~500KB-1MB)

### Issue: Wrong images / not relevant

**Fix**: Claude's image search queries can be refined in the prompt. The system searches for:
- "digital transformation [topic]"
- "data analytics dashboard"
- "automation workflow diagram"
- etc.

## Image Guidelines

### What Makes a Good Search Query?

✅ **Specific**: "data analytics dashboard visualization"
❌ **Generic**: "data"

✅ **Professional**: "business team collaboration meeting"
❌ **Amateur**: "people working"

✅ **Contextual**: "AI machine learning algorithm visualization"
❌ **Vague**: "technology"

### Search Query Best Practices

The system automatically generates queries, but Claude can be guided:
- Include industry context: "manufacturing automation"
- Specify visual type: "infographic", "dashboard", "diagram"
- Add quality indicators: "professional", "modern", "clean"

## Privacy & Compliance

### Unsplash License

All Unsplash images are free to use:
- ✅ Commercial use allowed
- ✅ No attribution required (but nice to include)
- ✅ Modify, distribute, and use in products
- ❌ Cannot sell unmodified photos
- ❌ Cannot use to create competing photo platform

### GDPR Compliance

Using Unsplash API is GDPR-compliant:
- No personal data is collected
- Images are public domain equivalents
- API calls don't store user information

## Alternative Image Sources

If Unsplash doesn't meet your needs:

### Pexels API
- Similar to Unsplash
- Also free with rate limits
- API: https://www.pexels.com/api/

### Pixabay API
- Larger library
- Some restrictions on commercial use
- API: https://pixabay.com/api/docs/

### Custom Implementation
You can modify the image search function to use:
- Your own image library
- Stock photo service (Getty, Shutterstock)
- Client-provided branding images

## Cost Comparison

| Service | Free Tier | Production | Best For |
|---------|-----------|------------|----------|
| **Unsplash** | 50/hr | 5,000/hr | Professional photos |
| **Pexels** | 200/hr | Unlimited* | High volume |
| **Pixabay** | Unlimited | Unlimited | Budget-friendly |

*Subject to fair use policy

## Recommended: Start Without Images

You can test the enhanced PowerPoint export WITHOUT configuring Unsplash:

1. The system will work fine without images
2. Industry insights and benchmarks will still be included
3. Presentations will be text-based (still professional)
4. Add images later when you're ready

## Configuration Checklist

- [ ] Create Unsplash account
- [ ] Register as developer
- [ ] Create application
- [ ] Copy Access Key
- [ ] Add to `.env.local`
- [ ] Restart dev server
- [ ] Test with an assessment
- [ ] Verify images in PowerPoint
- [ ] Check console logs for success

## Need Help?

1. **Unsplash Documentation**: https://unsplash.com/documentation
2. **Support**: help@unsplash.com
3. **Our Implementation**: See `pptx-content-generator-enhanced.ts:searchAndDownloadImage()`

---

**Ready to add professional imagery to your presentations?** 🎨

Just add your Unsplash API key and you're set!
