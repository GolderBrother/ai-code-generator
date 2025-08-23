import { Module } from '@nestjs/common';
import { ProjectDownloadService } from './project-download.service';
import { ScreenshotService } from './screenshot.service';

@Module({
  providers: [ProjectDownloadService, ScreenshotService],
  exports: [ProjectDownloadService, ScreenshotService],
})
export class ProjectModule {}