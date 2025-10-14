import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import BlogPage from './page';

// Mock framer-motion
jest.mock('framer-motion', () => {
  const MockDiv = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  MockDiv.displayName = 'motion.div';
  const MockArticle = ({ children, ...props }: any) => <article {...props}>{children}</article>;
  MockArticle.displayName = 'motion.article';

  return {
    motion: {
      div: MockDiv,
      article: MockArticle,
    },
  };
});

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useParams: () => ({}),
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  const MockLink = ({ children, href, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  );
  MockLink.displayName = 'Link';
  return MockLink;
});

// Mock Layout component
jest.mock('@/components/Layout', () => {
  const MockLayout = ({ children }: any) => <div data-testid="layout">{children}</div>;
  MockLayout.displayName = 'Layout';
  return MockLayout;
});

// Mock Breadcrumb component
jest.mock('@/components/Breadcrumb', () => {
  const MockBreadcrumb = ({ items }: any) => (
    <nav data-testid="breadcrumb">
      {items.map((item: any, index: number) => (
        <span key={index}>{item.label}</span>
      ))}
    </nav>
  );
  MockBreadcrumb.displayName = 'Breadcrumb';
  return MockBreadcrumb;
});

// Mock the reading time utility
jest.mock('@/utils/readingTime', () => ({
  getReadingTime: (content: string) => '5 min read',
}));

describe('BlogPage Component', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should render loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(() =>
      new Promise(() => {}) // Never resolves
    );

    const { container } = render(<BlogPage />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should render all blog posts', async () => {
    const mockPosts = [
      {
        id: '1',
        title: 'First Post',
        content: 'Content 1',
        slug: 'first-post',
        published: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        author: { id: 'a1', name: 'Author 1', email: 'author1@example.com' },
        tags: [],
      },
      {
        id: '2',
        title: 'Second Post',
        content: 'Content 2',
        slug: 'second-post',
        published: true,
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        author: { id: 'a2', name: 'Author 2', email: 'author2@example.com' },
        tags: [],
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockPosts,
    });

    render(<BlogPage />);

    await waitFor(() => {
      expect(screen.getByText('First Post')).toBeInTheDocument();
      expect(screen.getByText('Second Post')).toBeInTheDocument();
    });
  });

  it('should wrap entire blog card in a clickable link', async () => {
    const mockPosts = [
      {
        id: '1',
        title: 'Clickable Card',
        content: 'This card should be clickable',
        slug: 'clickable-card',
        published: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        author: { id: 'a1', name: 'Author', email: 'test@example.com' },
        tags: [],
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockPosts,
    });

    render(<BlogPage />);

    await waitFor(() => {
      const links = screen.getAllByRole('link');
      const cardLink = links.find(link =>
        link.getAttribute('href') === '/blog/clickable-card' &&
        link.classList.contains('block')
      );

      expect(cardLink).toBeInTheDocument();
    });
  });

  it('should filter posts by search term', async () => {
    const mockPosts = [
      {
        id: '1',
        title: 'JavaScript Tutorial',
        content: 'Learn JavaScript basics',
        slug: 'javascript-tutorial',
        published: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        author: { id: 'a1', name: 'Author', email: 'test@example.com' },
        tags: [],
      },
      {
        id: '2',
        title: 'Python Guide',
        content: 'Python programming guide',
        slug: 'python-guide',
        published: true,
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        author: { id: 'a1', name: 'Author', email: 'test@example.com' },
        tags: [],
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockPosts,
    });

    render(<BlogPage />);

    await waitFor(() => {
      expect(screen.getByText('JavaScript Tutorial')).toBeInTheDocument();
      expect(screen.getByText('Python Guide')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search posts...');
    fireEvent.change(searchInput, { target: { value: 'JavaScript' } });

    await waitFor(() => {
      expect(screen.getByText('JavaScript Tutorial')).toBeInTheDocument();
      expect(screen.queryByText('Python Guide')).not.toBeInTheDocument();
    });
  });

  it('should filter posts by tag', async () => {
    const mockPosts = [
      {
        id: '1',
        title: 'React Post',
        content: 'React content',
        slug: 'react-post',
        published: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        author: { id: 'a1', name: 'Author', email: 'test@example.com' },
        tags: [{ id: 't1', name: 'React', color: 'blue' }],
      },
      {
        id: '2',
        title: 'Vue Post',
        content: 'Vue content',
        slug: 'vue-post',
        published: true,
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        author: { id: 'a1', name: 'Author', email: 'test@example.com' },
        tags: [{ id: 't2', name: 'Vue', color: 'green' }],
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockPosts,
    });

    render(<BlogPage />);

    await waitFor(() => {
      expect(screen.getByText('React Post')).toBeInTheDocument();
      expect(screen.getByText('Vue Post')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'React' } });

    await waitFor(() => {
      expect(screen.getByText('React Post')).toBeInTheDocument();
      expect(screen.queryByText('Vue Post')).not.toBeInTheDocument();
    });
  });

  it('should handle tag button clicks without navigating', async () => {
    const mockPosts = [
      {
        id: '1',
        title: 'Post with Tags',
        content: 'Content',
        slug: 'post-with-tags',
        published: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        author: { id: 'a1', name: 'Author', email: 'test@example.com' },
        tags: [
          { id: 't1', name: 'Technology', color: 'blue' },
          { id: 't2', name: 'JavaScript', color: 'yellow' },
        ],
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockPosts,
    });

    render(<BlogPage />);

    await waitFor(() => {
      expect(screen.getByText('Post with Tags')).toBeInTheDocument();
    });

    const tagButtons = screen.getAllByText('Technology');
    // Click the button tag (not the option in select)
    const tagButton = tagButtons.find(el => el.tagName === 'BUTTON');
    if (tagButton) {
      fireEvent.click(tagButton);

      // After clicking tag, the tag should be selected in filter
      await waitFor(() => {
        const select = screen.getByRole('combobox') as HTMLSelectElement;
        expect(select.value).toBe('Technology');
      });
    }
  });

  it('should clear filters when clicking "Clear filters" button', async () => {
    const mockPosts = [
      {
        id: '1',
        title: 'Post 1',
        content: 'Content 1',
        slug: 'post-1',
        published: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        author: { id: 'a1', name: 'Author', email: 'test@example.com' },
        tags: [{ id: 't1', name: 'Tech', color: 'blue' }],
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockPosts,
    });

    render(<BlogPage />);

    await waitFor(() => {
      expect(screen.getByText('Post 1')).toBeInTheDocument();
    });

    // Apply search filter
    const searchInput = screen.getByPlaceholderText('Search posts...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });

    await waitFor(() => {
      expect(screen.getByText('Clear filters')).toBeInTheDocument();
    });

    // Clear filters
    const clearButton = screen.getByText('Clear filters');
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(searchInput).toHaveValue('');
      expect(screen.queryByText('Clear filters')).not.toBeInTheDocument();
    });
  });

  it('should display "No posts found" when search has no results', async () => {
    const mockPosts = [
      {
        id: '1',
        title: 'Existing Post',
        content: 'Content',
        slug: 'existing-post',
        published: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        author: { id: 'a1', name: 'Author', email: 'test@example.com' },
        tags: [],
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockPosts,
    });

    render(<BlogPage />);

    await waitFor(() => {
      expect(screen.getByText('Existing Post')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search posts...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent search term' } });

    await waitFor(() => {
      expect(screen.getByText('No posts found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search terms or filters.')).toBeInTheDocument();
    });
  });

  it('should display "No posts yet" when there are no posts at all', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => [],
    });

    render(<BlogPage />);

    await waitFor(() => {
      expect(screen.getByText('No posts yet')).toBeInTheDocument();
      expect(screen.getByText('Check back soon for new content!')).toBeInTheDocument();
    });
  });

  it('should display reading time for each post', async () => {
    const mockPosts = [
      {
        id: '1',
        title: 'Post with Reading Time',
        content: 'This is the content',
        slug: 'post-with-reading-time',
        published: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        author: { id: 'a1', name: 'Author', email: 'test@example.com' },
        tags: [],
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockPosts,
    });

    render(<BlogPage />);

    await waitFor(() => {
      expect(screen.getByText('5 min read')).toBeInTheDocument();
    });
  });

  it('should show filter count when filters are active', async () => {
    const mockPosts = [
      {
        id: '1',
        title: 'Post 1',
        content: 'Content 1',
        slug: 'post-1',
        published: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        author: { id: 'a1', name: 'Author', email: 'test@example.com' },
        tags: [],
      },
      {
        id: '2',
        title: 'Post 2',
        content: 'Content 2',
        slug: 'post-2',
        published: true,
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        author: { id: 'a1', name: 'Author', email: 'test@example.com' },
        tags: [],
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockPosts,
    });

    render(<BlogPage />);

    await waitFor(() => {
      expect(screen.getByText('Post 1')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search posts...');
    fireEvent.change(searchInput, { target: { value: 'Post 1' } });

    await waitFor(() => {
      expect(screen.getByText('Showing 1 of 2 posts')).toBeInTheDocument();
    });
  });

  it('should handle fetch errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<BlogPage />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching posts:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('should render breadcrumb with Blog label', () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => [],
    });

    render(<BlogPage />);

    const breadcrumb = screen.getByTestId('breadcrumb');
    expect(breadcrumb).toHaveTextContent('Blog');
  });
});
