import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalShellComponent } from '../../shared/components/modal-shell/modal-shell.component';
import { NotificationService } from '../../core/services/notification.service';
import { GeneratedContentItem, GeneratedContentService } from '../tenants/generated-content.service';

const splitList = (value: string): string[] => value.split(',').map((part) => part.trim()).filter(Boolean);

@Component({
  selector: 'app-boost-ad-dialog',
  standalone: true,
  imports: [ModalShellComponent, ReactiveFormsModule],
  template: `
    <app-modal-shell title="Run ad request" [dismissible]="!submitting()" (closed)="cancelled.emit()">
      <form modal-body id="boost-ad-form" [formGroup]="form" (ngSubmit)="submit()">
        <p class="boost-subject">{{ title() }}</p>
        <div class="boost-grid">
          <div class="field"><label for="dailyBudget">Daily budget (₹)</label><input id="dailyBudget" class="inp" type="number" min="1" formControlName="dailyBudget" /></div>
          <div class="field"><label for="durationDays">Duration (days)</label><input id="durationDays" class="inp" type="number" min="1" formControlName="durationDays" /></div>
        </div>
        <div class="field">
          <label for="objective">Objective</label>
          <select id="objective" class="inp" formControlName="objective">
            @for (objective of objectives; track objective.value) { <option [value]="objective.value">{{ objective.label }}</option> }
          </select>
        </div>
        <div class="field"><label for="countries">Countries (comma separated)</label><input id="countries" class="inp" formControlName="countries" placeholder="IN" /></div>
        <div class="field"><label for="cities">Cities (comma separated)</label><input id="cities" class="inp" formControlName="cities" placeholder="Bengaluru, Ramanagara" /></div>
        <div class="boost-grid">
          <div class="field"><label for="ageMin">Min age</label><input id="ageMin" class="inp" type="number" min="13" max="65" formControlName="ageMin" /></div>
          <div class="field"><label for="ageMax">Max age</label><input id="ageMax" class="inp" type="number" min="13" max="65" formControlName="ageMax" /></div>
        </div>
        <label class="boost-check"><input type="checkbox" formControlName="autoActivate" /> Activate the ad immediately after creation</label>
        @if (form.invalid && form.touched) { <p class="field-error">Check the budget, duration, countries and age range.</p> }
      </form>
      <ng-container modal-footer>
        <button type="button" class="btn" [disabled]="submitting()" (click)="cancelled.emit()">Cancel</button>
        <button type="submit" form="boost-ad-form" class="btn btn-gold" [disabled]="submitting()">{{ submitting() ? 'Sending…' : 'Send request' }}</button>
      </ng-container>
    </app-modal-shell>
  `,
  styles: [`.boost-subject { margin:0 0 14px; color:var(--color-text-muted); font-size:12.5px; } .boost-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; } .boost-check { display:flex; align-items:center; gap:8px; color:var(--color-text-muted); font-size:12.5px; cursor:pointer; }`],
})
export class BoostAdDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly generatedContentService = inject(GeneratedContentService);
  private readonly notifications = inject(NotificationService);

  readonly item = input.required<GeneratedContentItem>();
  readonly title = input<string>('');
  readonly defaultCities = input<string[]>([]);
  readonly submitting = signal(false);
  readonly cancelled = output<void>();
  readonly boosted = output<void>();

  readonly objectives = [
    { value: 'OUTCOME_ENGAGEMENT', label: 'Engagement' },
    { value: 'OUTCOME_AWARENESS', label: 'Awareness' },
    { value: 'OUTCOME_TRAFFIC', label: 'Traffic' },
    { value: 'OUTCOME_LEADS', label: 'Leads' },
    { value: 'OUTCOME_SALES', label: 'Sales' },
  ];

  readonly form = this.fb.nonNullable.group({
    dailyBudget: [200, [Validators.required, Validators.min(1)]],
    durationDays: [7, [Validators.required, Validators.min(1)]],
    objective: ['OUTCOME_ENGAGEMENT', Validators.required],
    countries: ['IN', Validators.required],
    cities: [''],
    ageMin: [18, [Validators.required, Validators.min(13), Validators.max(65)]],
    ageMax: [55, [Validators.required, Validators.min(13), Validators.max(65)]],
    autoActivate: [false],
  });

  ngOnInit(): void {
    this.form.controls.cities.setValue(this.defaultCities().join(', '));
  }

  submit(): void {
    this.form.markAllAsTouched();
    const value = this.form.getRawValue();
    const countries = splitList(value.countries);
    if (this.form.invalid || !countries.length || value.ageMin > value.ageMax || this.submitting()) {
      this.form.setErrors({ invalid: true });
      return;
    }
    this.submitting.set(true);
    this.generatedContentService.boost({
      userId: this.item().userId,
      generatedContentId: this.item().id,
      dailyBudget: Number(value.dailyBudget),
      durationDays: Number(value.durationDays),
      objective: value.objective,
      countries,
      cities: splitList(value.cities),
      ageMin: Number(value.ageMin),
      ageMax: Number(value.ageMax),
      autoActivate: value.autoActivate,
    }).subscribe({
      next: () => {
        this.notifications.success('Ad request sent', `${this.title()} has been submitted to run on Facebook.`);
        this.boosted.emit();
      },
      error: () => this.submitting.set(false),
    });
  }
}
