import {
  Component,
  input,
  output,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ModalShellComponent } from '../../../shared/components/modal-shell/modal-shell.component';
import { NotificationService } from '../../../core/services/notification.service';
import { Editor } from '../../../core/services/editor';

@Component({
  selector: 'app-editor-task-modal',
  standalone: true,
  imports: [
    ModalShellComponent,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './editor-task-modal.component.html',
})
export class EditorTaskModalComponent implements OnInit {
  private readonly notifications = inject(NotificationService);
  private readonly editorService = inject(Editor);

  // Parent sends only content ID
  readonly taskId = input.required<string>();

  // Used for history/read-only mode
  readonly readOnly = input<boolean>(false);

  // Selected content
  readonly content = signal<any | null>(null);

  // Close modal event
  readonly closed = output<void>();
  readonly showVideoUpload = signal<boolean>(false);
  readonly selectedVideo = signal<File | null>(null);
  readonly isUploading = signal<boolean>(false);

  ngOnInit(): void {
    this.getContent();
  }

  /**
   * Get logged-in editor/user ID from localStorage
   *
   * Expected localStorage structure:
   *
   * {
   *   "success": true,
   *   "message": "Login successful.",
   *   "accessToken": "...",
   *   "user": {
   *     "userId": "44228f9c-0928-4330-b198-13b42765ef0e",
   *     "name": "Akash Video Editor",
   *     "email": "ave@gmail.com",
   *     "roles": ["editor"]
   *   }
   * }
   */
  private getEditorId(): string | null {
    const authData = localStorage.getItem('marketos.auth.session');

    if (!authData) {
      console.error('Auth session not found in localStorage');
      return null;
    }

    try {
      const parsedData = JSON.parse(authData);

      return parsedData?.user?.userId ?? null;
    } catch (error) {
      console.error(
        'Failed to parse auth session from localStorage:',
        error
      );

      return null;
    }
  }

  /**
   * Get selected content using the ID received from parent
   */
  getContent(): void {
    const contentId = this.taskId();

    if (!contentId) {
      return;
    }

    this.editorService.getAllContent().subscribe({
      next: (response: any) => {
        const contents = Array.isArray(response)
          ? response
          : response?.contents ?? response?.data ?? [];

        const selectedContent = contents.find(
          (item: any) => item.id === contentId
        );

        if (!selectedContent) {
          this.notifications.error(
            'Content not found',
            'Unable to find the selected content.'
          );

          return;
        }

        this.content.set(selectedContent);
      },

      error: (error) => {
        console.error(
          'Failed to load content:',
          error
        );

        this.notifications.error(
          'Error',
          'Failed to load content.'
        );
      },
    });
  }

  /**
   * Parse generated AI content
   */
  getGeneratedData(): any {
    const generatedContent =
      this.content()?.generatedContent;

    if (!generatedContent) {
      return null;
    }

    try {
      if (typeof generatedContent === 'object') {
        return generatedContent;
      }

      return JSON.parse(generatedContent);
    } catch (error) {
      console.error(
        'Failed to parse generated content:',
        error
      );

      return null;
    }
  }

  /**
   * Close modal
   */
  close(): void {
    this.closed.emit();
  }

  /**
   * Start editing
   *
   * editorId comes from logged-in user's localStorage
   */
  startEditing(): void {
    const content = this.content();

    if (!content) {
      return;
    }

    const editorId = this.getEditorId();

    if (!editorId) {
      this.notifications.error(
        'Error',
        'Editor user ID not found.'
      );

      return;
    }

    this.editorService
      .updateContentStatus(content.id, {
        editorId: editorId,
        editorStatus: 'IN_PROGRESS',
      })
      .subscribe({
        next: () => {
          content.editorStatus = 'IN_PROGRESS';

          this.content.set({
            ...content,
          });

          this.notifications.info(
            'Editing started',
            `${content.productName || 'Content'} moved to In Progress`
          );
        },

        error: (error) => {
          console.error(
            'Failed to update editor status:',
            error
          );

          this.notifications.error(
            'Update failed',
            'Unable to start editing. Please try again.'
          );
        },
      });
  }

  /**
   * Mark content as done
   *
   * editorId comes from logged-in user's localStorage
   */
  markDone(): void {
    const content = this.content();

    if (!content) {
      return;
    }

    const editorId = this.getEditorId();

    if (!editorId) {
      this.notifications.error(
        'Error',
        'Editor user ID not found.'
      );

      return;
    }

    this.editorService
      .updateContentStatus(content.id, {
        editorId: editorId,
        editorStatus: 'DONE',
      })
      .subscribe({
        next: () => {
          content.editorStatus = 'DONE';

          this.content.set({
            ...content,
          });

          this.notifications.success(
            'Marked done',
            `${content.productName || 'Content'} marked as done`
          );
        },

        error: (error) => {
          console.error(
            'Failed to mark content as done:',
            error
          );

          this.notifications.error(
            'Update failed',
            'Unable to mark content as done.'
          );
        },
      });
  }

  /**
   * Move content back to In Progress
   *
   * editorId comes from logged-in user's localStorage
   */
  backToInProgress(): void {
    const content = this.content();

    if (!content) {
      return;
    }

    const editorId = this.getEditorId();

    if (!editorId) {
      this.notifications.error(
        'Error',
        'Editor user ID not found.'
      );

      return;
    }

    this.editorService
      .updateContentStatus(content.id, {
        editorId: editorId,
        editorStatus: 'IN_PROGRESS',
      })
      .subscribe({
        next: () => {
          content.editorStatus = 'IN_PROGRESS';

          this.content.set({
            ...content,
          });

          this.notifications.warning(
            'Reopened',
            `${content.productName || 'Content'} moved back to In Progress`
          );
        },

        error: (error) => {
          console.error(
            'Failed to reopen content:',
            error
          );

          this.notifications.error(
            'Update failed',
            'Unable to move content back to In Progress.'
          );
        },
      });
  }

  /**
   * Publish content
   */
  publish(): void {
    const content = this.content();

    if (!content) {
      return;
    }

    // Open video upload section
    this.showVideoUpload.set(true);
  }


  onVideoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    this.handleVideoFile(file);
  }

  onVideoDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;

    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];

    this.handleVideoFile(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  private handleVideoFile(file: File): void {
    console.log('========== VIDEO SELECTED ==========');
    console.log('File:', file);
    console.log('Name:', file.name);
    console.log('Type:', file.type);
    console.log('Size:', file.size);
    console.log('Size MB:', (file.size / 1024 / 1024).toFixed(2));
    console.log('====================================');

    if (!file.type.startsWith('video/')) {
      this.notifications.error(
        'Invalid file',
        'Please select a valid video file.'
      );

      return;
    }

    this.selectedVideo.set(file);
  }

  logSelectedVideo(): void {
    const video = this.selectedVideo();

    if (!video) {
      return;
    }

    console.log('========== SELECTED VIDEO ==========');
    console.log('File:', video);
    console.log('Name:', video.name);
    console.log('Type:', video.type);
    console.log('Size:', video.size);
    console.log('Size MB:', (video.size / 1024 / 1024).toFixed(2));
    console.log('====================================');
  }

  submitVideo(): void {
    const content = this.content();
    const video = this.selectedVideo();

    if (!content || !video) {
      return;
    }

    this.isUploading.set(true);

    this.editorService.uploadMedia(content.id, video).subscribe({
      next: () => {
        this.isUploading.set(false);
        this.notifications.success(
          'Video uploaded',
          'The video is ready to be published.'
        );
        this.closeVideoUpload();
        this.close();
      },
      error: (error) => {
        this.isUploading.set(false);
        console.error('Failed to upload video:', error);
        this.notifications.error(
          'Upload failed',
          'Unable to upload the video. Please try again.'
        );
      },
    });
  }

  closeVideoUpload(): void {
    if (this.isUploading()) {
      return;
    }

    this.showVideoUpload.set(false);
    this.selectedVideo.set(null);
  }
}