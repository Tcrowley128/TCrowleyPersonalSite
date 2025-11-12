const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'found' : 'missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'found' : 'missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function populateAssessmentVersions() {
  try {
    console.log('Fetching 4th Source assessment...');

    // Find the 4th Source assessment
    const { data: assessments, error: assessmentError } = await supabase
      .from('assessments')
      .select('id, company_name')
      .ilike('company_name', '%4th Source%')
      .order('created_at', { ascending: false })
      .limit(1);

    if (assessmentError) throw assessmentError;
    if (!assessments || assessments.length === 0) {
      console.error('No 4th Source assessment found');
      return;
    }

    const assessment = assessments[0];
    console.log(`Found assessment: ${assessment.company_name} (${assessment.id})`);

    // Check if versions already exist
    const { data: existingVersions } = await supabase
      .from('assessment_versions')
      .select('id')
      .eq('assessment_id', assessment.id);

    if (existingVersions && existingVersions.length > 0) {
      console.log(`Assessment already has ${existingVersions.length} versions. Skipping...`);
      return;
    }

    // Get the current assessment results for snapshot
    const { data: results, error: resultsError } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('assessment_id', assessment.id)
      .single();

    if (resultsError) throw resultsError;

    // Get responses for snapshot
    const { data: responses, error: responsesError } = await supabase
      .from('assessment_responses')
      .select('*')
      .eq('assessment_id', assessment.id)
      .order('step_number');

    if (responsesError) throw responsesError;

    console.log('Creating test version history...');

    // Define version history with realistic improvement summaries
    const versionHistory = [
      {
        version_number: 1,
        created_by: 'system',
        change_summary: 'Initial assessment results generated',
        created_at: new Date('2024-12-01T10:00:00Z').toISOString()
      },
      {
        version_number: 2,
        created_by: 'AI Assistant',
        change_summary: 'Added 3 quick wins: Document digitization, Automated email routing, Cloud-based collaboration tools',
        created_at: new Date('2024-12-15T14:30:00Z').toISOString()
      },
      {
        version_number: 3,
        created_by: 'Tyler Crowder',
        change_summary: 'Updated timeline estimates based on team feedback - Extended Phase 1 by 2 months',
        created_at: new Date('2025-01-05T09:15:00Z').toISOString()
      },
      {
        version_number: 4,
        created_by: 'AI Assistant',
        change_summary: 'Enhanced automation strategy: Added RPA recommendations for invoice processing (Est. savings: $45K/year)',
        created_at: new Date('2025-01-20T16:45:00Z').toISOString()
      },
      {
        version_number: 5,
        created_by: 'Tyler Crowder',
        change_summary: 'Completed "Document Management System" project - Updated maturity score from 2.5 to 3.2',
        created_at: new Date('2025-02-10T11:20:00Z').toISOString()
      },
      {
        version_number: 6,
        created_by: 'AI Assistant',
        change_summary: 'Refined data strategy: Added Power BI dashboard recommendations and data governance framework',
        created_at: new Date('2025-03-01T13:00:00Z').toISOString()
      },
      {
        version_number: 7,
        created_by: 'Tyler Crowder',
        change_summary: 'Sprint 1 completed: 5 quick wins deployed, team trained on new collaboration tools',
        created_at: new Date('2025-03-15T10:30:00Z').toISOString()
      },
      {
        version_number: 8,
        created_by: 'AI Assistant',
        change_summary: 'AI strategy enhanced: Added Microsoft Copilot pilot program, estimated 15% productivity boost',
        created_at: new Date('2025-04-02T14:15:00Z').toISOString()
      },
      {
        version_number: 9,
        created_by: 'Tyler Crowder',
        change_summary: 'Adjusted priorities: Moved "Customer Portal" to high priority due to stakeholder feedback',
        created_at: new Date('2025-04-20T09:45:00Z').toISOString()
      },
      {
        version_number: 10,
        created_by: 'AI Assistant',
        change_summary: 'Latest: Added change management recommendations and training plan for Q2 2025 initiatives',
        created_at: new Date('2025-05-01T08:00:00Z').toISOString()
      }
    ];

    // Insert versions with proper snapshots
    for (const version of versionHistory) {
      const { error: insertError } = await supabase
        .from('assessment_versions')
        .insert({
          assessment_id: assessment.id,
          version_number: version.version_number,
          is_current: version.version_number === versionHistory.length,
          results_snapshot: results,
          responses_snapshot: responses || [],
          created_by: version.created_by,
          change_summary: version.change_summary,
          created_at: version.created_at
        });

      if (insertError) {
        console.error(`Error creating version ${version.version_number}:`, insertError);
      } else {
        console.log(`✓ Created version ${version.version_number}: ${version.change_summary}`);
      }
    }

    console.log('\n✅ Successfully populated assessment versions!');
    console.log(`Total versions created: ${versionHistory.length}`);
    console.log('\nYou can now see the live feed on the Executive Dashboard!');

  } catch (error) {
    console.error('Error populating assessment versions:', error);
    process.exit(1);
  }
}

populateAssessmentVersions();
