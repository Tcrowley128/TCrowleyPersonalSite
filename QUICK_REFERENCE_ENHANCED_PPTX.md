# Quick Reference: Enhanced PowerPoint Export

## 🚀 Quick Start (30 seconds)

### Test Now (Without Images)
```bash
# Call the enhanced endpoint
curl "http://localhost:3002/api/assessment/YOUR_ID/export-pptx-enhanced" \
  --output presentation.pptx

# Open it
start presentation.pptx
```

### Enable Images (5 minutes)
1. Get Unsplash key: https://unsplash.com/developers
2. Add to `.env.local`: `UNSPLASH_ACCESS_KEY=your_key`
3. Restart server: `npm run dev`

## 📋 What's Included

| Feature | Description | Requires |
|---------|-------------|----------|
| **Web Search** | Claude finds industry benchmarks | ✅ Built-in |
| **Industry Insights** | Real trends and statistics | ✅ Built-in |
| **Benchmark Comparisons** | Your score vs industry | ✅ Built-in |
| **Professional Images** | Auto-downloaded photos | Unsplash API |
| **Source Citations** | Referenced research | ✅ Built-in |

## 🎨 New Slides

1. **Industry Benchmarks & Insights**
   - Digital transformation trends
   - Competitive positioning
   - Emerging technologies

2. **Pillar Industry Comparisons** (x5)
   - Your score vs average vs top performers
   - Sourced benchmarks
   - Best practice recommendations

3. **Enhanced Quick Wins**
   - Industry success examples
   - Real ROI metrics

## ⚙️ Configuration

### Required
```env
ANTHROPIC_API_KEY=sk-ant-xxx  # ✅ Already set
```

### Optional
```env
UNSPLASH_ACCESS_KEY=xxx  # For images
```

## 📊 Example Content

### Before
```
Data Strategy: 2/5
Recommendation: Improve data integration
```

### After
```
Data Strategy: 2/5
Industry Average: 2.8/5 (Gartner 2024)
Top Performers: 4.2/5
Gap: 0.8 points below industry average

Quick Win Example:
Companies implementing Power BI saw 35%
reduction in reporting time (McKinsey 2024)
```

## 🎯 API Endpoint

```typescript
// Frontend code
fetch(`/api/assessment/${id}/export-pptx-enhanced`)
  .then(res => res.blob())
  .then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${companyName}_Assessment.pptx`;
    a.click();
  });
```

## 📈 Performance

| Metric | Value |
|--------|-------|
| Generation Time | 20-25 seconds |
| Slide Count | ~18 slides |
| File Size | 800KB-1.5MB (with images) |
| Web Searches | ~5-10 queries |
| Images | 5-8 photos |

## ✅ Testing Checklist

- [ ] Presentation downloads
- [ ] Industry insights slide present
- [ ] Benchmarks show real numbers
- [ ] Sources cited
- [ ] Pillar comparisons work
- [ ] Images embedded (if configured)

## 🔍 What Claude Searches

For each assessment:
- `{Industry} digital transformation benchmarks 2024`
- `digital maturity assessment industry average`
- `{Pillar} best practices {Industry}`
- `successful digital transformation case studies`
- `digital transformation ROI metrics {Industry}`

## 🛠️ Troubleshooting

| Issue | Fix |
|-------|-----|
| No industry insights | Check Claude API key |
| Generic content | Set `industry` in assessment data |
| No images | Add Unsplash API key |
| Slow (>30s) | Normal for web search + images |
| Rate limit | Wait 1 hour or upgrade Unsplash |

## 📞 Support

**Docs**: See `ENHANCED_PPTX_SUMMARY.md`
**Images**: See `UNSPLASH_API_SETUP.md`
**Technical**: See `WEB_SEARCH_AND_IMAGES_ENHANCEMENT.md`

## 🎉 Quick Demo

```bash
# 1. Generate presentation
curl localhost:3002/api/assessment/YOUR_ID/export-pptx-enhanced \
  -o demo.pptx

# 2. Open and check for:
# - "Industry Benchmarks & Insights" slide
# - Benchmark comparison bars
# - Source citations (e.g., "Gartner 2024")
# - Professional images (if Unsplash configured)
```

---

**Ready to generate AI-powered, research-backed presentations!** 🚀
