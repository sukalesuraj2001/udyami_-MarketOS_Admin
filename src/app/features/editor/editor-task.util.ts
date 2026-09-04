import { EditorTaskStatus, EditorTaskType } from '../../core/models/domain.model';
import { StatusTagVariant } from '../../shared/components/status-tag/status-tag.component';

export function editorTaskTypeLabel(type: EditorTaskType): string {
  switch (type) {
    case 'reel': return 'Reel';
    case 'video': return 'Video';
    case 'youtube_short': return 'YouTube Short';
    case 'youtube_long': return 'YouTube Long';
  }
}

export function editorTaskTypeVariant(type: EditorTaskType): StatusTagVariant {
  switch (type) {
    case 'reel': return 'violet';
    case 'video': return 'info';
    case 'youtube_short': return 'warn';
    case 'youtube_long': return 'neutral';
  }
}

export function editorTaskStatusLabel(status: EditorTaskStatus): string {
  switch (status) {
    case 'pending': return 'Pending';
    case 'in_progress': return 'In Progress';
    case 'done': return 'Done';
   
  }
}

export function editorTaskStatusVariant(status: EditorTaskStatus): StatusTagVariant {
  switch (status) {
    case 'pending': return 'warn';
    case 'in_progress': return 'info';
    case 'done': return 'ok';
  }
}
