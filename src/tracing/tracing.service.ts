import {
  Injectable,
  OnModuleInit,
  OnApplicationShutdown,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

@Injectable()
export class TracingService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(TracingService.name);
  private sdk: NodeSDK;

  constructor(private configService: ConfigService) {
    // Enable OpenTelemetry debug logging
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

    // Configure Jaeger exporter
    const jaegerHost = this.configService.get<string>(
      'JAEGER_HOST',
      'localhost',
    );
    const jaegerPort = this.configService.get<number>('JAEGER_PORT', 6831);

    const exporter = new JaegerExporter({
      host: jaegerHost,
      port: jaegerPort,
    });

    // Create SDK with auto-instrumentation
    this.sdk = new NodeSDK({
      traceExporter: exporter,
      instrumentations: [getNodeAutoInstrumentations()],
      serviceName: 'nestjs-starter',
    });
  }

  async onModuleInit() {
    try {
      await this.sdk.start();
      this.logger.log('Jaeger tracing initialized');
      this.logger.log('Jaeger UI available at http://localhost:16686');
    } catch (error) {
      this.logger.error('Error initializing Jaeger tracing', error);
    }
  }

  async onApplicationShutdown() {
    try {
      await this.sdk.shutdown();
      this.logger.log('Jaeger tracing shut down');
    } catch (error) {
      this.logger.error('Error shutting down Jaeger tracing', error);
    }
  }
}
