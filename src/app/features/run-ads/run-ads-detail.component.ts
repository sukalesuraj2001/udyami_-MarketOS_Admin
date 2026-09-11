import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DigitalUser } from '../../core/models/domain.model';
import { TenantsService } from '../tenants/tenants.service';
import { NotificationService } from '../../core/services/notification.service';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { GeneratedContentItem, GeneratedContentPayload, GeneratedContentService } from '../tenants/generated-content.service';

@Component({ selector: 'app-run-ads-detail', standalone: true, imports: [RouterLink, SkeletonComponent], templateUrl: './run-ads-detail.component.html', styleUrl: './run-ads-detail.component.scss' })
export class RunAdsDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly tenantsService = inject(TenantsService);
  private readonly generatedContentService = inject(GeneratedContentService);
  private readonly notifications = inject(NotificationService);
  readonly user = signal<DigitalUser | null>(null);
  readonly generatedContent = signal<GeneratedContentItem[]>([]);
  readonly adContent = computed(() => this.generatedContent().filter((item) => /^(meta|google)_ads$/i.test(item.platform)));
  readonly loading = signal(true);
  readonly contentLoading = signal(true);
  readonly contentError = signal<string | null>(null);

  constructor() {
    const userId = this.route.snapshot.paramMap.get('userId');
    this.tenantsService.list().subscribe({ next: (users) => { this.user.set(users.find((user) => user.userId === userId) ?? null); this.loading.set(false); }, error: () => this.loading.set(false) });
    if (userId) {
      this.generatedContentService.getByUser(userId).subscribe({
        next: (content) => { this.generatedContent.set(content); this.contentLoading.set(false); },
        error: () => { this.contentError.set('Generated ad content could not be loaded.'); this.contentLoading.set(false); },
      });
    } else {
      this.contentLoading.set(false);
    }
  }

  businessName(user: DigitalUser): string { return user.profile?.businessDetails?.businessName || user.profile?.selectedBusinessVertical || 'Independent business'; }
  location(user: DigitalUser): string { return user.businessLocation || user.officeLocation || user.profile?.cityOfResidence || user.profile?.district || 'Not set'; }
  createCampaign(): void { this.notifications.success('Campaign workspace opened', 'Choose your objective and creative to begin this campaign.'); }
  runAd(item: GeneratedContentItem): void { this.notifications.success('Ad queued to run', `${this.title(item)} will be launched on ${item.platform.replace('_', ' ')}.`); }
  payload(item: GeneratedContentItem): GeneratedContentPayload {
    if (typeof item.generatedContent === 'object') return item.generatedContent as unknown as GeneratedContentPayload;
    try { return JSON.parse(item.generatedContent || '{}') as GeneratedContentPayload; }
    catch { return item.aiResponse?.response || item.aiResponse?.marketingContent || {}; }
  }
  title(item: GeneratedContentItem): string { return this.payload(item).headline || item.aiResponse?.activity?.title || item.activityType.replace(/_/g, ' '); }
  scheduledFor(item: GeneratedContentItem): string { return item.aiResponse?.activity?.date || item.createdAt.slice(0, 10); }
  displayStatus(item: GeneratedContentItem): string { return (item.editorStatus || item.status || 'Generated').replace(/_/g, ' '); }
  isMetaReady(item: GeneratedContentItem): boolean { return /meta|facebook|instagram/i.test(item.platform); }
  isVideo(item: GeneratedContentItem): boolean { return item.mediaType?.toLowerCase().includes('video') || item.contentType?.toLowerCase() === 'video' || item.activityType === 'REEL'; }
}
