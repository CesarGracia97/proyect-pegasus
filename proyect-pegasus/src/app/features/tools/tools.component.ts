import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioConvertComponent } from './componets/audio-convert/audio-convert.component';
import { VideoConvertComponent } from './componets/video-convert/video-convert.component';

export type ActiveTool = 'audio' | 'video' | 'extra' | null;

@Component({
  selector: 'app-tools',
  standalone: true,
  imports: [CommonModule, AudioConvertComponent, VideoConvertComponent],
  templateUrl: './tools.component.html',
  styleUrl: './tools.component.scss',
})
export class ToolsComponent {
  activeTool = signal<ActiveTool>(null); 

  toolsList = [
    { id: 'audio' as ActiveTool, name: 'Convertidor de Audio', icon: '🎵'},
    { id: 'video' as ActiveTool, name: 'Convertidor de Video', icon: '🎬'},
    { id: 'extra' as ActiveTool, name: 'Módulo Extra', icon: '🚀'}
  ];

  setTool(tool: ActiveTool): void {
    this.activeTool.set(tool);
  }

  isClosing = false;

  closePanel() {
    if (this.isClosing) return;
    this.isClosing = true;

    setTimeout(() => {
      this.activeTool.set(null); 
      this.isClosing = false;
    }, 1200);
  }
}