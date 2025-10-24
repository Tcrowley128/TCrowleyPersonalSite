# PowerPoint Export with Claude API Integration

## Overview

This implementation creates **Dynamic, AI-Generated PowerPoint Presentations** for Digital Transformation Assessments using Claude API. Each presentation is personalized based on the actual assessment results while maintaining consistent Bosch template styling.

## How It Works

### 1. **Content Generation (Claude API)**

When a user clicks "Export to PowerPoint", the system:

1. Fetches the assessment data and results from Supabase
2. Sends the data to Claude API with detailed instructions
3. Claude analyzes the assessment scores, answers, and company context
4. Generates personalized, actionable content for each slide
5. Returns structured JSON with all slide content

### 2. **Presentation Assembly (PptxGenJS)**

The system then:

1. Creates a PowerPoint presentation using the Bosch template design
2. Populates each slide with Claude-generated content
3. Applies consistent formatting, colors, and styling
4. Returns the .pptx file for download

## Architecture

```
┌─────────────────┐
│  User clicks    │
│ "Export PPTX"   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  API: /api/assessment/[id]/export-pptx-enhanced         │
├─────────────────────────────────────────────────────────┤
│  1. Fetch Assessment Data (Supabase)                    │
│  2. Fetch Assessment Results (Supabase)                 │
│  3. Generate Content (Claude API) ◄─────────────┐       │
│  4. Create Presentation (PptxGenJS)             │       │
│  5. Return .pptx file                           │       │
└──────────────────────────────────────────────────┬───────┘
                                                   │
                                                   │
                    ┌──────────────────────────────┴────────┐
                    │ pptx-content-generator.ts              │
                    ├────────────────────────────────────────┤
                    │ • Sends assessment data to Claude API  │
                    │ • Receives structured JSON response    │
                    │ • Validates and returns SlideContent   │
                    └────────────────────────────────────────┘
```

## File Structure

```
src/
├── app/api/assessment/[id]/
│   ├── export-pptx/              # Original endpoint (static content)
│   │   └── route.ts
│   └── export-pptx-enhanced/     # NEW: Claude-powered endpoint
│       └── route.ts
│
└── lib/services/
    └── pptx-content-generator.ts # NEW: Claude API integration
```

## Implementation Details

### Content Generator (`pptx-content-generator.ts`)

**Purpose**: Interfaces with Claude API to generate presentation content

**Key Function**:
```typescript
generatePresentationContent(assessmentData, resultsData): Promise<SlideContent>
```

**Claude Prompt Strategy**:
- Provides detailed instructions for content generation
- Specifies exact JSON structure for output
- Includes assessment scores, company info, and maturity levels
- Requests specific, actionable recommendations based on actual data

**Content Structure** (returned by Claude):
```typescript
{
  currentState: {
    summary: string,
    painPoints: string[],
    techStack: { current: string[], underutilized: string[] }
  },
  pillars: {
    data_strategy: { currentState, capabilities, gaps, targetState, keyInitiatives },
    automation: { ... },
    ai_integration: { ... },
    people_culture: { ... },
    user_experience: { ... }
  },
  quickWins: [{ title, description, timeline, effort, impact, outcome }],
  roadmap: { month1, month2, month3 },
  changeManagement: { communication, training },
  successMetrics: { business, adoption },
  nextSteps: { week1, month1 }
}
```

### Enhanced Export Endpoint (`export-pptx-enhanced/route.ts`)

**Purpose**: Creates PowerPoint presentation using Claude-generated content

**Process**:
1. Fetch data from Supabase
2. Call `generatePresentationContent()`
3. Create PptxGenJS presentation
4. Populate slides with personalized content
5. Apply Bosch template styling
6. Return .pptx file

**Bosch Template Design Specifications**:
- **Color Scheme**: Dark blue background (#0A1628), light blue accent (#7B9CFF), purple accent (#A78BFF)
- **Typography**: Arial, large headers, clear hierarchy
- **Layout**: 16:9 aspect ratio (960x540px)
- **Style**: Modern, professional, technology-focused

## API Endpoint

### `GET /api/assessment/[id]/export-pptx-enhanced`

**Parameters**:
- `id` (path): Assessment ID

**Response**:
- Content-Type: `application/vnd.openxmlformats-officedocument.presentationml.presentation`
- File: `{CompanyName}_Digital_Transformation_Assessment.pptx`

**Error Responses**:
- `404`: Assessment not found
- `404`: Assessment results not found
- `500`: Failed to generate presentation

## Example Usage

### From Frontend

```typescript
// Assessment results page
const handleExportPowerPoint = async () => {
  try {
    const response = await fetch(
      `/api/assessment/${assessmentId}/export-pptx-enhanced`
    );

    if (!response.ok) {
      throw new Error('Failed to export presentation');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${companyName}_Assessment.pptx`;
    a.click();
  } catch (error) {
    console.error('Export failed:', error);
  }
};
```

### Button Component

```tsx
<Button
  onClick={handleExportPowerPoint}
  variant="outline"
  disabled={isExporting}
>
  {isExporting ? 'Generating...' : 'Export to PowerPoint'}
</Button>
```

## Content Personalization

Claude API personalizes content based on:

1. **Maturity Scores**: Identifies lowest-scoring pillars for priority recommendations
2. **Company Context**: Uses company name, industry, and assessment date
3. **Pain Points**: Derives from low scores and gap analysis
4. **Quick Wins**: Suggests 30-day initiatives targeting specific gaps
5. **Technology Stack**: Recommends tools based on current capabilities
6. **Roadmap**: Creates phased implementation plan aligned with scores

## Consistency Guarantees

Each presentation follows the same structure:

1. Title Slide
2. Agenda
3. Executive Summary
4. Current State Assessment (with actual scores)
5. Key Opportunity (based on lowest pillar)
6. Pillar Deep Dives (5 pillars)
7. Quick Wins (Claude-generated, 30-day actions)
8. 90-Day Roadmap (Claude-generated)
9. Technology Recommendations
10. Change Management
11. Success Metrics
12. Next Steps

**Visual Consistency**: All slides use identical:
- Color palette (Bosch template)
- Font families and sizes
- Layout patterns
- Icon styles
- Spacing and alignment

## Environment Variables Required

```env
ANTHROPIC_API_KEY=sk-ant-xxx  # Claude API key
```

## Testing

### Manual Test

1. Create an assessment with complete results
2. Navigate to assessment results page
3. Click "Export to PowerPoint"
4. Verify .pptx downloads
5. Open file and verify:
   - Company name appears correctly
   - Actual maturity scores are shown
   - Content is specific to assessment data
   - Bosch template styling is applied
   - All slides are present

### API Test

```bash
curl -X GET "http://localhost:3002/api/assessment/{ASSESSMENT_ID}/export-pptx-enhanced" \
  --output test_presentation.pptx
```

## Benefits

✅ **Personalized**: Each presentation is unique to the company's assessment
✅ **Consistent**: Always follows Bosch template design
✅ **Actionable**: Claude generates specific, implementable recommendations
✅ **Professional**: High-quality, board-ready presentations
✅ **Scalable**: Works for any assessment without manual intervention
✅ **Fast**: Generates in ~10-15 seconds

## Future Enhancements

1. **Add more slide types**: Benchmark comparisons, ROI calculations, risk analysis
2. **Custom branding**: Allow clients to upload logos and color schemes
3. **Multi-language support**: Generate presentations in different languages
4. **Template variants**: Offer different template styles (Bosch, Deloitte, McKinsey)
5. **Interactive elements**: Add embedded charts from actual assessment data
6. **Version tracking**: Track which presentations have been generated

## Troubleshooting

### Issue: "Assessment results not found"
**Solution**: Ensure the assessment has been generated first by calling `/api/assessment/generate`

### Issue: "Failed to generate PowerPoint"
**Solution**: Check Claude API key is set in environment variables

### Issue: Content is too generic
**Solution**: Verify assessment results contain detailed maturity scores and pillar data

### Issue: Presentation doesn't match Bosch template
**Solution**: Check COLORS constant in route.ts matches template specifications

## Migration from Original Endpoint

To replace the original `/export-pptx` endpoint:

1. Update frontend to call `/export-pptx-enhanced` instead
2. Test thoroughly with multiple assessments
3. Once verified, rename `/export-pptx-enhanced` to `/export-pptx`
4. Archive the old implementation

## Conclusion

This implementation delivers on the requirements:
- ✅ Uses Claude API for dynamic content generation
- ✅ References actual assessment result data
- ✅ Follows Bosch template design specifications
- ✅ Maintains consistency across all exports
- ✅ Provides professional, actionable presentations
- ✅ Works automatically when user clicks export button
