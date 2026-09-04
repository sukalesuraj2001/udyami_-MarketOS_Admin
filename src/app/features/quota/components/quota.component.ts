import {
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { finalize } from 'rxjs';

import { QuotaService } from '../quota.service';

import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';
import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

interface AnthropicUsage {
  provider: string;

  window: {
    type: string;
    startingAt: string;
    endingAt: string;
  };

  organizationUsage: {
    inputTokens: number;
    outputTokens: number;
    cacheCreationTokens: number;
    cacheReadTokens: number;
    totalTokens: number;
    tokenLimit: number;
    tokenUsagePercentage: number;
    remainingTokens: number | null;
    inputTokenPercentage: number;
    outputTokenPercentage: number;
    webSearchRequests: number;
  };
}

interface BusinessDetails {
  businessName?: string;
  business_name?: string;
  name?: string;
}

interface UserProfile {
  businessDetails?: string | BusinessDetails | null;
}

interface UserAiTokenUsage {
  profile: UserProfile | null;
  userId: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  totalRequests: number;
}

@Component({
  selector: 'app-quota-page',
  standalone: true,
  imports: [
    KpiCardComponent,
    ProgressBarComponent,
    SkeletonComponent,
  ],
  templateUrl: './quota.component.html',
})
export class QuotaComponent implements OnInit {
  private readonly quotaService = inject(QuotaService);
  private readonly tokenLimit = 100000;

  /**
   * Anthropic organization token quota percentage.
   *
   * Example:
   * totalTokens = 55280
   * tokenLimit = 100000
   * percentage = 55.28
   */
  readonly anthropicQuotaPct =
    signal<number>(0);

  /**
   * AI token usage grouped by user.
   */
  readonly usersAiTokenUsage =
    signal<UserAiTokenUsage[]>([]);

  /**
   * Loading state for user token usage.
   */
  readonly usersLoading =
    signal<boolean>(true);

  /**
   * Main page loading state.
   */
  readonly loading =
    signal<boolean>(true);

  ngOnInit(): void {
    this.getAnthropicUsage();
    this.getAllUsersAiTokenUsage();
  }

  /**
   * Get Anthropic organization usage.
   */
  private getAnthropicUsage(): void {
    this.quotaService
      .getAnthropicUsage()
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (data: AnthropicUsage) => {
          console.log(
            'Anthropic Usage:',
            data,
          );

          const percentage = Number(
            data?.organizationUsage
              ?.tokenUsagePercentage ?? 0,
          );

          this.anthropicQuotaPct.set(
            this.clampPercentage(
              percentage,
            ),
          );
        },

        error: (error) => {
          console.error(
            'Error fetching Anthropic usage:',
            error,
          );

          this.anthropicQuotaPct.set(0);
        },
      });
  }

  /**
   * Get AI token usage for all users.
   */
private getAllUsersAiTokenUsage(): void {
  this.quotaService
    .getAllUsersAiTokenUsage()
    .pipe(
      finalize(() => {
        this.usersLoading.set(false);
      }),
    )
    .subscribe({
      next: (data: UserAiTokenUsage[]) => {
        console.log(
          'All Users AI Token Usage:',
          data,
        );

        const users: UserAiTokenUsage[] =
          Array.isArray(data)
            ? data.map((usage) => ({
                userId: usage.userId,

                inputTokens:
                  Number(usage.inputTokens) || 0,

                outputTokens:
                  Number(usage.outputTokens) || 0,

                totalTokens:
                  Number(usage.totalTokens) || 0,

                totalRequests:
                  Number(usage.totalRequests) || 0,

                profile:
                  usage.profile ?? null,
              }))
            : [];

        this.usersAiTokenUsage.set(users);
      },

      error: (error) => {
        console.error(
          'Error fetching users AI token usage:',
          error,
        );

        this.usersAiTokenUsage.set([]);
      },
    });
}

  /**
   * Returns the highest token usage
   * among all users.
   *
   * The highest-consuming user
   * becomes 100%.
   */


  /**
   * Calculate a user's token usage
   * percentage relative to the
   * highest-consuming user.
   *
   * Example:
   *
   * User A = 10,000
   * User B = 5,000
   *
   * User A = 100%
   * User B = 50%
   */

  userTokenPercentage(totalTokens: number): number {
    const tokens = Number(totalTokens) || 0;

    if (!this.tokenLimit) {
      return 0;
    }

    const percentage =
      (tokens / this.tokenLimit) * 100;

    return Math.min(
      Math.max(percentage, 0),
      100,
    );
  }

  /**
   * Keep percentage between 0 and 100.
   */
  private clampPercentage(
    percentage: number,
  ): number {
    return Math.min(
      Math.max(
        Number(percentage) || 0,
        0,
      ),
      100,
    );
  }

getBusinessName(
  usage: UserAiTokenUsage,
): string {
  if (!usage.profile) {
    return 'Business';
  }

  const details =
    usage.profile.businessDetails;

  if (!details) {
    return 'Business';
  }

  if (typeof details === 'string') {
    return details;
  }

  if (typeof details === 'object') {
    return (
      details.businessName ||
      details.business_name ||
      details.name ||
      'Business'
    );
  }

  return 'Business';
}
}