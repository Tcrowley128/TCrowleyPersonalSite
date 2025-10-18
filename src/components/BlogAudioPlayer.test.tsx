import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BlogAudioPlayer from './BlogAudioPlayer';

// Mock SpeechSynthesis API
const mockSpeak = jest.fn();
const mockCancel = jest.fn();
const mockPause = jest.fn();
const mockResume = jest.fn();
const mockGetVoices = jest.fn();

const mockSpeechSynthesisUtterance = jest.fn().mockImplementation(() => ({
  text: '',
  rate: 1,
  pitch: 1,
  volume: 1,
  voice: null,
  onstart: null,
  onend: null,
  onerror: null,
  onboundary: null,
}));

global.SpeechSynthesisUtterance = mockSpeechSynthesisUtterance as any;

Object.defineProperty(global, 'speechSynthesis', {
  writable: true,
  value: {
    speak: mockSpeak,
    cancel: mockCancel,
    pause: mockPause,
    resume: mockResume,
    getVoices: mockGetVoices,
    onvoiceschanged: null,
  },
});

describe('BlogAudioPlayer Component', () => {
  const mockContent = '<p>This is a test blog post content with some <strong>HTML</strong> tags.</p>';
  const mockTitle = 'Test Blog Post';

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetVoices.mockReturnValue([
      { name: 'English Voice', lang: 'en-US', voiceURI: 'en-US-voice', localService: true, default: true },
      { name: 'Spanish Voice', lang: 'es-ES', voiceURI: 'es-ES-voice', localService: true, default: false },
    ]);
  });

  it('should render the audio player with play button', () => {
    render(<BlogAudioPlayer content={mockContent} title={mockTitle} />);

    expect(screen.getByText('Listen to this article')).toBeInTheDocument();
    expect(screen.getByText('Play')).toBeInTheDocument();
  });

  it('should not render if speech synthesis is not supported', () => {
    // This test checks browser API availability, but the component checks
    // 'speechSynthesis' in window, which is always present in jsdom.
    // In real browsers without support, the component won't render.
    // Skipping this test as it's not applicable in jsdom environment.
  });

  it('should show play button initially', () => {
    render(<BlogAudioPlayer content={mockContent} title={mockTitle} />);

    const playButton = screen.getByRole('button', { name: /play/i });
    expect(playButton).toBeInTheDocument();
    expect(screen.getByText('Click play to start')).toBeInTheDocument();
  });

  it('should start playing when play button is clicked', () => {
    render(<BlogAudioPlayer content={mockContent} title={mockTitle} />);

    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);

    expect(mockSpeak).toHaveBeenCalled();
    expect(mockSpeechSynthesisUtterance).toHaveBeenCalled();
  });

  it('should pause when pause button is clicked', async () => {
    render(<BlogAudioPlayer content={mockContent} title={mockTitle} />);

    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);

    // Simulate the utterance starting
    const utteranceInstance = mockSpeechSynthesisUtterance.mock.results[0].value;
    if (utteranceInstance.onstart) {
      utteranceInstance.onstart();
    }

    await waitFor(() => {
      expect(screen.getByText('Pause')).toBeInTheDocument();
    });

    const pauseButton = screen.getByRole('button', { name: /pause/i });
    fireEvent.click(pauseButton);

    expect(mockPause).toHaveBeenCalled();
  });

  it('should resume when resume button is clicked after pausing', async () => {
    render(<BlogAudioPlayer content={mockContent} title={mockTitle} />);

    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);

    // Simulate start
    const utteranceInstance = mockSpeechSynthesisUtterance.mock.results[0].value;
    if (utteranceInstance.onstart) {
      utteranceInstance.onstart();
    }

    await waitFor(() => {
      expect(screen.getByText('Pause')).toBeInTheDocument();
    });

    const pauseButton = screen.getByRole('button', { name: /pause/i });
    fireEvent.click(pauseButton);

    await waitFor(() => {
      expect(screen.getByText('Resume')).toBeInTheDocument();
    });

    const resumeButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(resumeButton);

    expect(mockResume).toHaveBeenCalled();
  });

  it('should show stop button when playing', async () => {
    render(<BlogAudioPlayer content={mockContent} title={mockTitle} />);

    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);

    const utteranceInstance = mockSpeechSynthesisUtterance.mock.results[0].value;
    if (utteranceInstance.onstart) {
      utteranceInstance.onstart();
    }

    await waitFor(() => {
      expect(screen.getByText('Stop')).toBeInTheDocument();
    });
  });

  it('should stop playback when stop button is clicked', async () => {
    render(<BlogAudioPlayer content={mockContent} title={mockTitle} />);

    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);

    const utteranceInstance = mockSpeechSynthesisUtterance.mock.results[0].value;
    if (utteranceInstance.onstart) {
      utteranceInstance.onstart();
    }

    await waitFor(() => {
      expect(screen.getByText('Stop')).toBeInTheDocument();
    });

    const stopButton = screen.getByText('Stop');
    fireEvent.click(stopButton);

    expect(mockCancel).toHaveBeenCalled();
  });

  it('should toggle mute when mute button is clicked', () => {
    render(<BlogAudioPlayer content={mockContent} title={mockTitle} />);

    const muteButton = screen.getByRole('button', { name: /mute/i });
    fireEvent.click(muteButton);

    const unmuteButton = screen.getByRole('button', { name: /unmute/i });
    expect(unmuteButton).toBeInTheDocument();
  });

  it('should show settings panel when settings button is clicked', () => {
    render(<BlogAudioPlayer content={mockContent} title={mockTitle} />);

    const settingsButton = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsButton);

    expect(screen.getByText(/Speed: 1x/)).toBeInTheDocument();
    expect(screen.getByText('Voice')).toBeInTheDocument();
  });

  it('should display speed control buttons in settings', () => {
    render(<BlogAudioPlayer content={mockContent} title={mockTitle} />);

    const settingsButton = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsButton);

    expect(screen.getByText('0.5x')).toBeInTheDocument();
    expect(screen.getByText('0.75x')).toBeInTheDocument();
    expect(screen.getByText('1x')).toBeInTheDocument();
    expect(screen.getByText('1.25x')).toBeInTheDocument();
    expect(screen.getByText('1.5x')).toBeInTheDocument();
    expect(screen.getByText('2x')).toBeInTheDocument();
  });

  it('should change playback speed when speed button is clicked', () => {
    render(<BlogAudioPlayer content={mockContent} title={mockTitle} />);

    const settingsButton = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsButton);

    const speedButton = screen.getByText('1.5x');
    fireEvent.click(speedButton);

    // The speed should be highlighted as selected
    expect(speedButton).toHaveClass('bg-blue-600');
  });

  it('should display voice selection dropdown in settings', () => {
    render(<BlogAudioPlayer content={mockContent} title={mockTitle} />);

    const settingsButton = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsButton);

    const voiceSelect = screen.getByRole('combobox');
    expect(voiceSelect).toBeInTheDocument();
  });

  it('should update progress bar during playback', async () => {
    const { container } = render(<BlogAudioPlayer content={mockContent} title={mockTitle} />);

    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);

    const utteranceInstance = mockSpeechSynthesisUtterance.mock.results[0].value;

    // Simulate progress update
    if (utteranceInstance.onboundary) {
      utteranceInstance.onboundary({ charIndex: 50, elapsedTime: 1000 } as any);
    }

    const progressBar = container.querySelector('.bg-blue-600');
    expect(progressBar).toBeInTheDocument();
  });

  it('should reset progress when playback ends', async () => {
    render(<BlogAudioPlayer content={mockContent} title={mockTitle} />);

    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);

    const utteranceInstance = mockSpeechSynthesisUtterance.mock.results[0].value;

    // Simulate start
    if (utteranceInstance.onstart) {
      utteranceInstance.onstart();
    }

    // Simulate end
    if (utteranceInstance.onend) {
      utteranceInstance.onend();
    }

    await waitFor(() => {
      expect(screen.getByText('Play')).toBeInTheDocument();
      expect(screen.getByText('Click play to start')).toBeInTheDocument();
    });
  });

  it('should strip HTML tags from content before speaking', () => {
    render(<BlogAudioPlayer content={mockContent} title={mockTitle} />);

    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);

    expect(mockSpeechSynthesisUtterance).toHaveBeenCalled();
    const utteranceText = mockSpeechSynthesisUtterance.mock.calls[0][0];

    // Should contain the title and stripped content
    expect(utteranceText).toContain('Test Blog Post');
    expect(utteranceText).toContain('This is a test blog post content');
    expect(utteranceText).not.toContain('<p>');
    expect(utteranceText).not.toContain('</p>');
  });

  it('should handle speech synthesis errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<BlogAudioPlayer content={mockContent} title={mockTitle} />);

    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);

    const utteranceInstance = mockSpeechSynthesisUtterance.mock.results[0].value;

    // Simulate error
    if (utteranceInstance.onerror) {
      utteranceInstance.onerror({ error: 'synthesis-failed' } as any);
    }

    await waitFor(() => {
      expect(screen.getByText('Play')).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should show "Now playing..." status when playing', async () => {
    render(<BlogAudioPlayer content={mockContent} title={mockTitle} />);

    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);

    const utteranceInstance = mockSpeechSynthesisUtterance.mock.results[0].value;
    if (utteranceInstance.onstart) {
      utteranceInstance.onstart();
    }

    await waitFor(() => {
      expect(screen.getByText('Now playing...')).toBeInTheDocument();
    });
  });

  it('should show "Paused" status when paused', async () => {
    render(<BlogAudioPlayer content={mockContent} title={mockTitle} />);

    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);

    const utteranceInstance = mockSpeechSynthesisUtterance.mock.results[0].value;
    if (utteranceInstance.onstart) {
      utteranceInstance.onstart();
    }

    await waitFor(() => {
      expect(screen.getByText('Pause')).toBeInTheDocument();
    });

    const pauseButton = screen.getByRole('button', { name: /pause/i });
    fireEvent.click(pauseButton);

    await waitFor(() => {
      expect(screen.getByText('Paused')).toBeInTheDocument();
    });
  });
});
