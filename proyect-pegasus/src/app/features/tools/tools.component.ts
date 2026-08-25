import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioConvertComponent } from './componets/audio-convert/audio-convert.component';
import { VideoConvertComponent } from './componets/video-convert/video-convert.component';

export type ActiveTool = 'audio' | 'video';

@Component({
  selector: 'app-tools',
  standalone: true,
  imports: [CommonModule, AudioConvertComponent, VideoConvertComponent],
  templateUrl: './tools.component.html',
  styleUrl: './tools.component.scss',
})
export class ToolsComponent {
  activeTool = signal<ActiveTool>('audio');

  setTool(tool: ActiveTool): void {
    this.activeTool.set(tool);
  }
}