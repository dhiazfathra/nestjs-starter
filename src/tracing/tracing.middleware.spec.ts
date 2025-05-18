import { Test, TestingModule } from '@nestjs/testing';
import { TracingMiddleware } from './tracing.middleware';
import { trace, SpanStatusCode, context, Span } from '@opentelemetry/api';

// Mock the OpenTelemetry trace API
jest.mock('@opentelemetry/api', () => {
  const originalModule = jest.requireActual('@opentelemetry/api');

  // Create a mock span
  const mockSpan = {
    setAttributes: jest.fn(),
    setStatus: jest.fn(),
    end: jest.fn(),
  };

  // Create a mock tracer
  const mockTracer = {
    startSpan: jest.fn().mockReturnValue(mockSpan),
  };

  return {
    ...originalModule,
    trace: {
      ...originalModule.trace,
      getTracer: jest.fn().mockReturnValue(mockTracer),
    },
    SpanStatusCode: originalModule.SpanStatusCode,
  };
});

describe('TracingMiddleware', () => {
  let middleware: TracingMiddleware;
  let mockRequest: any;
  let mockResponse: any;
  let mockNext: jest.Mock;
  let mockTracer: any;
  let mockSpan: any;

  beforeEach(async () => {
    middleware = new TracingMiddleware();

    // Reset mocks
    mockTracer = trace.getTracer('nestjs-http');
    mockSpan = mockTracer.startSpan('test');

    // Mock request
    mockRequest = {
      method: 'GET',
      originalUrl: '/test',
      ip: '127.0.0.1',
      headers: {
        'user-agent': 'test-agent',
        'x-request-id': 'test-id',
      },
    };

    // Mock response
    mockResponse = {
      statusCode: 200,
      end: jest.fn(),
    };

    // Mock next function
    mockNext = jest.fn();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  describe('use', () => {
    it('should create a span with request attributes', () => {
      middleware.use(mockRequest, mockResponse, mockNext);

      // Verify span was created with correct name
      expect(mockTracer.startSpan).toHaveBeenCalledWith('HTTP GET /test');

      // Verify attributes were set
      expect(mockSpan.setAttributes).toHaveBeenCalledWith({
        'http.method': 'GET',
        'http.url': '/test',
        'http.client_ip': '127.0.0.1',
        'http.user_agent': 'test-agent',
        'http.request_id': 'test-id',
      });

      // Verify next was called
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle missing headers gracefully', () => {
      const requestWithoutHeaders = {
        ...mockRequest,
        headers: {},
      };

      middleware.use(requestWithoutHeaders, mockResponse, mockNext);

      expect(mockSpan.setAttributes).toHaveBeenCalledWith(
        expect.objectContaining({
          'http.user_agent': '',
          'http.request_id': '',
        }),
      );
    });

    it('should override response.end to capture response data', () => {
      middleware.use(mockRequest, mockResponse, mockNext);

      // Original end function should be replaced
      expect(mockResponse.end).not.toBe(jest.fn());

      // Call the new end function
      const args = ['test-response'];
      mockResponse.end(...args);

      // Verify response attributes were set
      expect(mockSpan.setAttributes).toHaveBeenCalledWith({
        'http.status_code': 200,
      });

      // Verify span was ended
      expect(mockSpan.end).toHaveBeenCalled();
    });

    it('should mark span as error for 4xx status codes', () => {
      mockResponse.statusCode = 404;

      middleware.use(mockRequest, mockResponse, mockNext);
      mockResponse.end();

      expect(mockSpan.setStatus).toHaveBeenCalledWith({
        code: SpanStatusCode.ERROR,
        message: 'HTTP Error 404',
      });
    });

    it('should mark span as error for 5xx status codes', () => {
      mockResponse.statusCode = 500;

      middleware.use(mockRequest, mockResponse, mockNext);
      mockResponse.end();

      expect(mockSpan.setStatus).toHaveBeenCalledWith({
        code: SpanStatusCode.ERROR,
        message: 'HTTP Error 500',
      });
    });
  });
});
