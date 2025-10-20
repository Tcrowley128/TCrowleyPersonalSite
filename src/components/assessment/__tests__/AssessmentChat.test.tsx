import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AssessmentChat from '../AssessmentChat';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock react-markdown
jest.mock('react-markdown', () => {
  return ({ children }: any) => <div>{children}</div>;
});

// Mock remark-gfm
jest.mock('remark-gfm', () => ({}));

// Mock fetch
global.fetch = jest.fn();

describe('AssessmentChat', () => {
  const mockAssessmentId = 'test-assessment-id';

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ conversations: [] }),
    });
  });

  describe('Floating Button', () => {
    it('renders the floating chat button when closed', () => {
      render(<AssessmentChat assessmentId={mockAssessmentId} />);
      const button = screen.getByText('Ask Tyler\'s AI');
      expect(button).toBeInTheDocument();
    });

    it('opens chat when floating button is clicked', async () => {
      render(<AssessmentChat assessmentId={mockAssessmentId} />);
      const button = screen.getByText('Ask Tyler\'s AI');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Tyler\'s AI Assistant')).toBeInTheDocument();
      });
    });
  });

  describe('Chat Modal', () => {
    it('displays header with title and subtitle', async () => {
      render(<AssessmentChat assessmentId={mockAssessmentId} />);
      const button = screen.getByText('Ask Tyler\'s AI');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Tyler\'s AI Assistant')).toBeInTheDocument();
        expect(screen.getByText('Ask me anything about your assessment')).toBeInTheDocument();
      });
    });

    it('displays AI disclaimer', async () => {
      render(<AssessmentChat assessmentId={mockAssessmentId} />);
      const button = screen.getByText('Ask Tyler\'s AI');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/AI-Generated Content/)).toBeInTheDocument();
        expect(screen.getByText(/may contain errors/)).toBeInTheDocument();
      });
    });

    it('shows welcome message when no messages', async () => {
      render(<AssessmentChat assessmentId={mockAssessmentId} />);
      const button = screen.getByText('Ask Tyler\'s AI');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Welcome! I\'m here to help.')).toBeInTheDocument();
      });
    });

    it('displays suggested questions', async () => {
      render(<AssessmentChat assessmentId={mockAssessmentId} />);
      const button = screen.getByText('Ask Tyler\'s AI');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Why was this tool recommended/)).toBeInTheDocument();
        expect(screen.getByText(/What's the best place to start/)).toBeInTheDocument();
      });
    });

    it('closes chat when X button is clicked', async () => {
      render(<AssessmentChat assessmentId={mockAssessmentId} />);

      // Open chat
      const openButton = screen.getByText('Ask Tyler\'s AI');
      fireEvent.click(openButton);

      await waitFor(() => {
        expect(screen.getByText('Tyler\'s AI Assistant')).toBeInTheDocument();
      });

      // Close chat
      const closeButtons = screen.getAllByRole('button');
      const closeButton = closeButtons.find(btn => btn.querySelector('svg.lucide-x'));
      if (closeButton) {
        fireEvent.click(closeButton);
      }

      await waitFor(() => {
        expect(screen.queryByText('Tyler\'s AI Assistant')).not.toBeInTheDocument();
      });
    });
  });

  describe('Expand/Collapse Functionality', () => {
    it('has maximize button in header', async () => {
      render(<AssessmentChat assessmentId={mockAssessmentId} />);
      const button = screen.getByText('Ask Tyler\'s AI');
      fireEvent.click(button);

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        const maximizeButton = buttons.find(btn =>
          btn.getAttribute('title') === 'Expand'
        );
        expect(maximizeButton).toBeInTheDocument();
      });
    });

    it('toggles between expanded and normal view', async () => {
      render(<AssessmentChat assessmentId={mockAssessmentId} />);
      const button = screen.getByText('Ask Tyler\'s AI');
      fireEvent.click(button);

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        const toggleButton = buttons.find(btn =>
          btn.getAttribute('title') === 'Expand'
        );

        if (toggleButton) {
          fireEvent.click(toggleButton);

          // Check that title changed to Minimize
          const minimizeButton = buttons.find(btn =>
            btn.getAttribute('title') === 'Minimize'
          );
          expect(minimizeButton).toBeInTheDocument();
        }
      });
    });
  });

  describe('Message Input', () => {
    it('renders textarea input', async () => {
      render(<AssessmentChat assessmentId={mockAssessmentId} />);
      const button = screen.getByText('Ask Tyler\'s AI');
      fireEvent.click(button);

      await waitFor(() => {
        const input = screen.getByPlaceholderText('Ask about your assessment...');
        expect(input).toBeInTheDocument();
      });
    });

    it('allows typing in the input', async () => {
      const user = userEvent.setup();
      render(<AssessmentChat assessmentId={mockAssessmentId} />);
      const button = screen.getByText('Ask Tyler\'s AI');
      fireEvent.click(button);

      await waitFor(async () => {
        const input = screen.getByPlaceholderText('Ask about your assessment...') as HTMLTextAreaElement;
        await user.type(input, 'Test question');
        expect(input.value).toBe('Test question');
      });
    });

    it('shows helper text for keyboard shortcuts', async () => {
      render(<AssessmentChat assessmentId={mockAssessmentId} />);
      const button = screen.getByText('Ask Tyler\'s AI');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Press Enter to send/)).toBeInTheDocument();
      });
    });
  });

  describe('Sending Messages', () => {
    it('sends message when send button clicked', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          success: true,
          message: 'AI response',
          conversation_id: 'conv-123',
        }),
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: async () => ({ conversations: [] }) })
        .mockResolvedValueOnce(mockResponse);

      render(<AssessmentChat assessmentId={mockAssessmentId} />);
      const button = screen.getByText('Ask Tyler\'s AI');
      fireEvent.click(button);

      await waitFor(async () => {
        const input = screen.getByPlaceholderText('Ask about your assessment...') as HTMLTextAreaElement;
        fireEvent.change(input, { target: { value: 'Test question' } });

        const sendButtons = screen.getAllByRole('button');
        const sendButton = sendButtons[sendButtons.length - 1];
        fireEvent.click(sendButton);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/assessment/${mockAssessmentId}/chat`,
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: expect.stringContaining('Test question'),
          })
        );
      });
    });

    it('disables send button when input is empty', async () => {
      render(<AssessmentChat assessmentId={mockAssessmentId} />);
      const button = screen.getByText('Ask Tyler\'s AI');
      fireEvent.click(button);

      await waitFor(() => {
        const sendButtons = screen.getAllByRole('button');
        const sendButton = sendButtons[sendButtons.length - 1];
        expect(sendButton).toBeDisabled();
      });
    });

    it('shows loading state while sending', async () => {
      const mockResponse = new Promise(resolve =>
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({
            success: true,
            message: 'AI response',
            conversation_id: 'conv-123',
          }),
        }), 100)
      );

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: async () => ({ conversations: [] }) })
        .mockImplementationOnce(() => mockResponse);

      render(<AssessmentChat assessmentId={mockAssessmentId} />);
      const button = screen.getByText('Ask Tyler\'s AI');
      fireEvent.click(button);

      await waitFor(async () => {
        const input = screen.getByPlaceholderText('Ask about your assessment...') as HTMLTextAreaElement;
        fireEvent.change(input, { target: { value: 'Test question' } });

        const sendButtons = screen.getAllByRole('button');
        const sendButton = sendButtons[sendButtons.length - 1];
        fireEvent.click(sendButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/Tyler's AI is thinking/)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when API fails', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: async () => ({ conversations: [] }) })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Failed to send message' }),
        });

      render(<AssessmentChat assessmentId={mockAssessmentId} />);
      const button = screen.getByText('Ask Tyler\'s AI');
      fireEvent.click(button);

      await waitFor(async () => {
        const input = screen.getByPlaceholderText('Ask about your assessment...') as HTMLTextAreaElement;
        fireEvent.change(input, { target: { value: 'Test question' } });

        const sendButtons = screen.getAllByRole('button');
        const sendButton = sendButtons[sendButtons.length - 1];
        fireEvent.click(sendButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/Failed to send message/)).toBeInTheDocument();
      });
    });
  });

  describe('Conversation History', () => {
    it('loads conversation history on open', async () => {
      const mockConversations = [{
        id: 'conv-1',
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there!' },
        ],
      }];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ conversations: mockConversations }),
      });

      render(<AssessmentChat assessmentId={mockAssessmentId} />);
      const button = screen.getByText('Ask Tyler\'s AI');
      fireEvent.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/assessment/${mockAssessmentId}/chat`
        );
      });
    });
  });
});
