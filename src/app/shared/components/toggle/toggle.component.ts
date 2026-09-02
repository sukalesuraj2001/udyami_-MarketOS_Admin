import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-toggle',
  standalone: true,
  template: `
    <button
      type="button"
      class="tog"
      [class.on]="checked()"
      [disabled]="disabled()"
      role="switch"
      [attr.aria-checked]="checked()"
      [attr.aria-label]="ariaLabel()"
      (click)="toggled.emit(!checked())"
    >
      <i></i>
    </button>
  `,
})
export class ToggleComponent {
  readonly checked = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly ariaLabel = input<string>('toggle');
  readonly toggled = output<boolean>();
}
