import { render, screen, waitFor } from '@testing-library/react';
import Blog from './Blog';

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
    useInView: () => true,
  };
});

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

// Mock the reading time utility
jest.mock('@/utils/readingTime', () => ({
  getReadingTime: (content: string) => '5 min read',
}));

describe('Blog Component', () => {
  beforeEach(() => {
    // Mock fetch
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should render loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(() =>
      new Promise(() => {}) // Never resolves
    );

    render(<Blog />);
    expect(screen.getByText('Loading posts...')).toBeInTheDocument();
  });

  it('should render empty state when no posts exist', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => [],
    });

    render(<Blog />);

    await waitFor(() => {
      expect(screen.getByText('Welcome to my blog!')).toBeInTheDocument();
    });
  });

  it('should render blog posts when data is available', async () => {
    const mockPosts = [
      {
        id: '1',
        title: 'Test Post 1',
        content: 'This is test content for post 1',
        excerpt: 'Test excerpt 1',
        slug: 'test-post-1',
        published: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        featured_image: 'https://example.com/image1.jpg',
        image_alt: 'Test image 1',
        author: {
          id: 'author1',
          name: 'Test Author',
          email: 'test@example.com',
        },
        tags: [
          { id: 'tag1', name: 'Technology', color: 'blue' },
        ],
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockPosts,
    });

    render(<Blog />);

    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      expect(screen.getByText('Test excerpt 1')).toBeInTheDocument();
      expect(screen.getByText('Technology')).toBeInTheDocument();
    });
  });

  it('should wrap entire blog card in a clickable link', async () => {
    const mockPosts = [
      {
        id: '1',
        title: 'Clickable Post',
        content: 'This post should be fully clickable',
        excerpt: 'Click anywhere on this card',
        slug: 'clickable-post',
        published: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        author: {
          id: 'author1',
          name: 'Test Author',
          email: 'test@example.com',
        },
        tags: [],
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockPosts,
    });

    render(<Blog />);

    await waitFor(() => {
      const links = screen.getAllByRole('link');
      // Find the link that wraps the article
      const cardLink = links.find(link =>
        link.getAttribute('href') === '/blog/clickable-post' &&
        link.classList.contains('block')
      );

      expect(cardLink).toBeInTheDocument();
    });
  });

  it('should display reading time for each post', async () => {
    const mockPosts = [
      {
        id: '1',
        title: 'Test Post',
        content: 'Content with reading time',
        slug: 'test-post',
        published: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        author: {
          id: 'author1',
          name: 'Test Author',
          email: 'test@example.com',
        },
        tags: [],
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockPosts,
    });

    render(<Blog />);

    await waitFor(() => {
      expect(screen.getByText('5 min read')).toBeInTheDocument();
    });
  });

  it('should limit display to 3 posts on homepage', async () => {
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
      {
        id: '3',
        title: 'Post 3',
        content: 'Content 3',
        slug: 'post-3',
        published: true,
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z',
        author: { id: 'a1', name: 'Author', email: 'test@example.com' },
        tags: [],
      },
      {
        id: '4',
        title: 'Post 4',
        content: 'Content 4',
        slug: 'post-4',
        published: true,
        created_at: '2024-01-04T00:00:00Z',
        updated_at: '2024-01-04T00:00:00Z',
        author: { id: 'a1', name: 'Author', email: 'test@example.com' },
        tags: [],
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockPosts,
    });

    render(<Blog />);

    await waitFor(() => {
      expect(screen.getByText('Post 1')).toBeInTheDocument();
      expect(screen.getByText('Post 2')).toBeInTheDocument();
      expect(screen.getByText('Post 3')).toBeInTheDocument();
      expect(screen.queryByText('Post 4')).not.toBeInTheDocument();
      expect(screen.getByText('See More Blogs')).toBeInTheDocument();
    });
  });

  it('should show "See All Blogs" button', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => [],
    });

    render(<Blog />);

    await waitFor(() => {
      expect(screen.getByText('See All Blogs')).toBeInTheDocument();
    });
  });

  it('should handle fetch errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<Blog />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching posts:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('should display post metadata (date, author)', async () => {
    const mockPosts = [
      {
        id: '1',
        title: 'Test Post',
        content: 'Content',
        slug: 'test-post',
        published: true,
        created_at: '2024-03-15T00:00:00Z',
        updated_at: '2024-03-15T00:00:00Z',
        author: {
          id: 'author1',
          name: 'John Doe',
          email: 'john@example.com',
        },
        tags: [],
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockPosts,
    });

    render(<Blog />);

    await waitFor(() => {
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
      expect(screen.getByText(/March/)).toBeInTheDocument();
      expect(screen.getByText(/2024/)).toBeInTheDocument();
    });
  });

  it('should render featured image when available', async () => {
    const mockPosts = [
      {
        id: '1',
        title: 'Post with Image',
        content: 'Content',
        slug: 'post-with-image',
        published: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        featured_image: 'https://example.com/featured.jpg',
        image_alt: 'Featured image description',
        author: {
          id: 'author1',
          name: 'Test Author',
          email: 'test@example.com',
        },
        tags: [],
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockPosts,
    });

    render(<Blog />);

    await waitFor(() => {
      const image = screen.getByAltText('Featured image description');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/featured.jpg');
    });
  });

  it('should use post title as image alt when image_alt is not provided', async () => {
    const mockPosts = [
      {
        id: '1',
        title: 'Post Title As Alt',
        content: 'Content',
        slug: 'post-title-as-alt',
        published: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        featured_image: 'https://example.com/image.jpg',
        author: {
          id: 'author1',
          name: 'Test Author',
          email: 'test@example.com',
        },
        tags: [],
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockPosts,
    });

    render(<Blog />);

    await waitFor(() => {
      const image = screen.getByAltText('Post Title As Alt');
      expect(image).toBeInTheDocument();
    });
  });

  it('should display post excerpt when available', async () => {
    const mockPosts = [
      {
        id: '1',
        title: 'Post with Excerpt',
        content: 'Full content goes here',
        excerpt: 'This is a custom excerpt',
        slug: 'post-with-excerpt',
        published: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        author: {
          id: 'author1',
          name: 'Test Author',
          email: 'test@example.com',
        },
        tags: [],
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockPosts,
    });

    render(<Blog />);

    await waitFor(() => {
      expect(screen.getByText('This is a custom excerpt')).toBeInTheDocument();
    });
  });

  it('should display truncated content when excerpt is not available', async () => {
    const longContent = 'a'.repeat(250);
    const mockPosts = [
      {
        id: '1',
        title: 'Post without Excerpt',
        content: longContent,
        slug: 'post-without-excerpt',
        published: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        author: {
          id: 'author1',
          name: 'Test Author',
          email: 'test@example.com',
        },
        tags: [],
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockPosts,
    });

    render(<Blog />);

    await waitFor(() => {
      const truncatedText = 'a'.repeat(200) + '...';
      expect(screen.getByText(truncatedText)).toBeInTheDocument();
    });
  });
});
