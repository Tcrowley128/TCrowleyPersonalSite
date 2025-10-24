// Example: How to integrate the PowerPoint export button into your assessment results page

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ExportButtonProps {
  assessmentId: string;
  companyName: string;
}

export function ExportToPowerPointButton({ assessmentId, companyName }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      toast.info('Generating presentation...', {
        description: 'This may take 10-15 seconds',
      });

      // Call the enhanced API endpoint
      const response = await fetch(
        `/api/assessment/${assessmentId}/export-pptx-enhanced`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate presentation');
      }

      // Get the file blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${companyName.replace(/[^a-z0-9]/gi, '_')}_Digital_Transformation_Assessment.pptx`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Presentation generated!', {
        description: 'Your PowerPoint has been downloaded',
      });
    } catch (error: any) {
      console.error('Export failed:', error);
      toast.error('Export failed', {
        description: error.message || 'Please try again or contact support',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant="outline"
      className="gap-2"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <FileText className="h-4 w-4" />
          Export to PowerPoint
        </>
      )}
    </Button>
  );
}

// ==============================================================================
// USAGE EXAMPLE IN YOUR RESULTS PAGE
// ==============================================================================

/*
// In your AssessmentResultsPage component:

import { ExportToPowerPointButton } from '@/components/assessment/ExportToPowerPointButton';

export default function AssessmentResultsPage({ params }: { params: { id: string } }) {
  // ... your existing code ...

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Assessment Results</h1>

        <div className="flex gap-2">
          {/* Other action buttons *\/}

          {/* PowerPoint Export Button *\/}
          <ExportToPowerPointButton
            assessmentId={params.id}
            companyName={assessment.company_name}
          />
        </div>
      </div>

      {/* Rest of your results page *\/}
    </div>
  );
}
*/

// ==============================================================================
// ALTERNATIVE: Inline implementation without separate component
// ==============================================================================

export function AssessmentResultsPageInline({ assessmentId, companyName }: { assessmentId: string; companyName: string }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportToPowerPoint = async () => {
    try {
      setIsExporting(true);

      const response = await fetch(`/api/assessment/${assessmentId}/export-pptx-enhanced`);

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${companyName}_Assessment.pptx`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Presentation downloaded!');
    } catch (error) {
      toast.error('Failed to export presentation');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Your results content */}

      <div className="flex justify-end">
        <Button onClick={handleExportToPowerPoint} disabled={isExporting}>
          {isExporting ? 'Generating...' : 'Export to PowerPoint'}
        </Button>
      </div>
    </div>
  );
}

// ==============================================================================
// WITH LOADING STATES AND PROGRESS
// ==============================================================================

export function ExportButtonWithProgress({ assessmentId, companyName }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setProgress(10);

      toast.info('Starting export...', { id: 'export-toast' });

      // Simulate progress (since we can't get real progress from the API)
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 90) return prev + 10;
          return prev;
        });
      }, 1000);

      const response = await fetch(`/api/assessment/${assessmentId}/export-pptx-enhanced`);

      clearInterval(progressInterval);
      setProgress(95);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const blob = await response.blob();
      setProgress(100);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${companyName.replace(/[^a-z0-9]/gi, '_')}_Assessment.pptx`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast.success('Export complete!', { id: 'export-toast' });
    } catch (error: any) {
      toast.error(error.message || 'Export failed', { id: 'export-toast' });
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleExport}
        disabled={isExporting}
        variant="outline"
        className="w-full sm:w-auto"
      >
        {isExporting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating ({progress}%)
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Export to PowerPoint
          </>
        )}
      </Button>

      {isExporting && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ==============================================================================
// DROPDOWN MENU WITH EXPORT OPTIONS
// ==============================================================================

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ExportDropdownMenu({ assessmentId, companyName }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'pptx' | 'pdf' | 'json') => {
    if (format === 'pptx') {
      setIsExporting(true);
      try {
        const response = await fetch(`/api/assessment/${assessmentId}/export-pptx-enhanced`);
        if (!response.ok) throw new Error('Export failed');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${companyName}_Assessment.pptx`;
        a.click();
        window.URL.revokeObjectURL(url);

        toast.success('PowerPoint downloaded!');
      } catch (error) {
        toast.error('Export failed');
      } finally {
        setIsExporting(false);
      }
    }
    // Handle other formats...
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export As</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport('pptx')}>
          <FileText className="mr-2 h-4 w-4" />
          PowerPoint (.pptx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')} disabled>
          <FileText className="mr-2 h-4 w-4" />
          PDF (Coming soon)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')} disabled>
          <FileText className="mr-2 h-4 w-4" />
          JSON (Coming soon)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ==============================================================================
// BEST PRACTICES
// ==============================================================================

/*

1. ERROR HANDLING
   - Always show user-friendly error messages
   - Log errors to console for debugging
   - Provide fallback options if export fails

2. LOADING STATES
   - Show clear loading indicator
   - Disable button during export
   - Optionally show progress (simulated or real)

3. USER FEEDBACK
   - Toast notification on success
   - Toast notification on error
   - Clear download completion indication

4. FILE NAMING
   - Use company name in filename
   - Sanitize filename (remove special characters)
   - Include date if needed: `${companyName}_${date}_Assessment.pptx`

5. ACCESSIBILITY
   - Proper button labels
   - Keyboard navigation support
   - Screen reader friendly

6. MOBILE SUPPORT
   - Handle mobile downloads properly
   - Responsive button sizing
   - Touch-friendly hit areas

*/
