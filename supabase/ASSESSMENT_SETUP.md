# Digital Transformation Assessment - Database Setup

## 🚀 Quick Setup

### Step 1: Run the Migration

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `migrations/20250117_assessment_system.sql`
5. Click **Run**

This will create:
- ✅ 4 main tables (assessments, assessment_responses, assessment_results, technology_solutions)
- ✅ Indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ Views for analytics
- ✅ Sample technology solutions data

### Step 2: Add Environment Variable for Claude API

Add to your `.env.local`:

```env
# Claude API for AI recommendations
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

Get your API key at: https://console.anthropic.com/

### Step 3: Verify Setup

Run this query in Supabase SQL Editor to verify:

```sql
-- Check tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'assessment%' OR table_name = 'technology_solutions';

-- Check sample data
SELECT name, category, tier FROM technology_solutions;
```

You should see:
- `assessments`
- `assessment_responses`
- `assessment_results`
- `technology_solutions`
- 8 sample technology solutions

---

## 📊 Database Schema Overview

### **assessments** table
Stores main assessment submissions with company info, technical capabilities, and status.

**Key fields:**
- `id` - UUID primary key
- `company_size`, `industry`, `user_role` - Company context
- `technical_capability` - Development resources available
- `transformation_approach` - Their preferred strategy
- `status` - IN_PROGRESS | COMPLETED | ABANDONED
- `email`, `contact_name` - Optional contact info

### **assessment_responses** table
Stores individual question/answer pairs.

**Key fields:**
- `assessment_id` - FK to assessments
- `step_number` - Which step of the assessment
- `question_key` - Question identifier
- `answer_value` - JSONB flexible storage

### **assessment_results** table
Stores AI-generated recommendations from Claude.

**Key fields:**
- `assessment_id` - FK to assessments (unique)
- `data_strategy`, `automation_strategy`, `ai_strategy` - Strategic pillars
- `tier1_citizen_led`, `tier2_hybrid`, `tier3_technical` - Tiered recommendations
- `quick_wins`, `roadmap`, `pilot_recommendations` - Actionable plans
- `change_management_plan` - People strategy
- `technology_recommendations` - Matched solutions

### **technology_solutions** table
Curated database of tools and platforms.

**Key fields:**
- `name`, `vendor`, `category` - Basic info
- `tier` - CITIZEN | HYBRID | TECHNICAL
- `complexity_level`, `learning_curve` - Difficulty ratings
- `requires_developers`, `business_user_friendly` - User requirements
- `price_range`, `free_tier_available` - Cost info
- `use_cases`, `best_for` - Recommendations context

---

## 🔐 Security Notes

### Row Level Security (RLS)

The migration enables RLS with these policies:

**Technology Solutions:**
- ✅ Publicly readable (for displaying recommendations)

**Assessments:**
- ✅ Anyone can create (INSERT)
- ✅ Users can view their own (by user_id or session_id)
- ✅ Admins can view/update all

**Results & Responses:**
- ✅ Users can view their own results
- ✅ Tied to assessment ownership

### Session-based access

For anonymous users, use `session_id` to track ownership:

```typescript
// In your API route
const sessionId = cookies().get('session_id')?.value || uuidv4();

// Save with assessment
await supabase.from('assessments').insert({
  session_id: sessionId,
  // ... other fields
});
```

---

## 📝 Adding More Technology Solutions

Use this template to add more tools:

```sql
INSERT INTO technology_solutions (
  name, vendor, category, tier, complexity_level, learning_curve,
  description, tagline, requires_developers, business_user_friendly,
  no_code, low_code, price_range, pricing_model, free_tier_available,
  implementation_time, use_cases, key_features, best_for, prerequisites,
  platforms, company_sizes, popularity_score, is_active
) VALUES (
  'Tool Name',
  'Vendor Name',
  'automation', -- data, automation, ai, collaboration, etc.
  'HYBRID', -- CITIZEN, HYBRID, TECHNICAL
  'MEDIUM', -- LOW, MEDIUM, HIGH
  'MEDIUM', -- LOW, MEDIUM, HIGH
  'Full description here',
  'Short tagline',
  false, -- requires_developers
  true, -- business_user_friendly
  false, -- no_code
  true, -- low_code
  '$$', -- FREE, $, $$, $$$, $$$$
  'subscription', -- free, freemium, subscription, enterprise, one_time
  true, -- free_tier_available
  'WEEKS', -- DAYS, WEEKS, MONTHS
  '["use_case_1", "use_case_2"]'::jsonb,
  '["feature_1", "feature_2"]'::jsonb,
  '["best_for_1", "best_for_2"]'::jsonb,
  ARRAY['Microsoft 365']::TEXT[],
  ARRAY['web', 'desktop']::TEXT[],
  ARRAY['small', 'medium', 'large']::TEXT[],
  8, -- popularity_score (1-10)
  true -- is_active
);
```

---

## 🎯 Next Steps

1. ✅ Run migration
2. ✅ Add ANTHROPIC_API_KEY to .env.local
3. Build assessment UI components
4. Create API routes for:
   - Submitting assessments
   - Generating recommendations with Claude
   - Retrieving results
5. Build results display page

---

## 🐛 Troubleshooting

**Migration fails:**
- Check if tables already exist: `DROP TABLE IF EXISTS assessments CASCADE;`
- Ensure you have proper permissions in Supabase

**RLS issues:**
- For development, you can temporarily disable RLS:
  ```sql
  ALTER TABLE assessments DISABLE ROW LEVEL SECURITY;
  ```
- Re-enable before production!

**Can't insert data:**
- Check RLS policies
- Verify your Supabase client is using the correct role
- Check for missing required fields
