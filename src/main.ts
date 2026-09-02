import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { ThemeService } from './app/core/services/theme.service';

// Applied synchronously, before Angular renders anything, so the correct
// dark/light theme paints on the very first frame (no flash of the wrong theme).
ThemeService.applyBeforeBootstrap();

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
