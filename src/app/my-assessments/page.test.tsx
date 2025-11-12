import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import MyAssessmentsPage from './page';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock Auth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

global.fetch = jest.fn();

describe('MyAssessmentsPage', () => {
  let mockRouter: any;
  let mockPush: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPush = jest.fn();
    mockRouter = { push: mockPush };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    (global.fetch as jest.Mock).mockClear();
  });

  it('should redirect to /assessment if user is not logged in', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });

    render(<MyAssessmentsPage />);

    expect(mockPush).toHaveBeenCalledWith('/assessment');
  });

  it('should show loading state initially', () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });

    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves to keep loading state
    );

    render(<MyAssessmentsPage />);

    // Check for loading spinner by class name since Loader2 is an SVG
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should display assessments when data is fetched successfully', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });

    const mockAssessments = [
      {
        id: 'assessment-1',
        company_name: 'Test Company 1',
        created_at: '2024-01-15T10:00:00Z',
        status: 'COMPLETED',
        completed_at: '2024-01-20T10:00:00Z',
      },
      {
        id: 'assessment-2',
        company_name: 'Test Company 2',
        created_at: '2024-02-10T10:00:00Z',
        status: 'IN_PROGRESS',
        completed_at: null,
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ assessments: mockAssessments }),
    });

    render(<MyAssessmentsPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Company 1')).toBeInTheDocument();
      expect(screen.getByText('Test Company 2')).toBeInTheDocument();
    });

    // Check status badges
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('should display empty state when user has no assessments', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ assessments: [] }),
    });

    render(<MyAssessmentsPage />);

    await waitFor(() => {
      expect(screen.getByText('No assessments yet')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Start your first digital transformation assessment to get personalized insights.'
        )
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Start Assessment')).toBeInTheDocument();
  });

  it('should display error message when fetch fails', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<MyAssessmentsPage />);

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load your assessments. Please try again later.')
      ).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should navigate to assessment journey when card is clicked', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });

    const mockAssessments = [
      {
        id: 'assessment-1',
        company_name: 'Test Company 1',
        created_at: '2024-01-15T10:00:00Z',
        status: 'COMPLETED',
        completed_at: '2024-01-20T10:00:00Z',
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ assessments: mockAssessments }),
    });

    render(<MyAssessmentsPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Company 1')).toBeInTheDocument();
    });

    const card = screen.getByText('Test Company 1').closest('div[role="button"]');
    if (card) {
      card.click();
      expect(mockPush).toHaveBeenCalledWith('/assessment/journey/assessment-1');
    }
  });

  it('should format dates correctly', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });

    const mockAssessments = [
      {
        id: 'assessment-1',
        company_name: 'Test Company',
        created_at: '2024-01-15T10:00:00Z',
        status: 'COMPLETED',
        completed_at: null,
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ assessments: mockAssessments }),
    });

    render(<MyAssessmentsPage />);

    await waitFor(() => {
      // Date should be formatted like "January 15, 2024"
      const dateElement = screen.getByText(/January 15, 2024/i);
      expect(dateElement).toBeInTheDocument();
    });
  });

  it('should show "Start New Assessment" button when user has assessments', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });

    const mockAssessments = [
      {
        id: 'assessment-1',
        company_name: 'Test Company',
        created_at: '2024-01-15T10:00:00Z',
        status: 'COMPLETED',
        completed_at: null,
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ assessments: mockAssessments }),
    });

    render(<MyAssessmentsPage />);

    await waitFor(() => {
      const buttons = screen.getAllByText('Start New Assessment');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
