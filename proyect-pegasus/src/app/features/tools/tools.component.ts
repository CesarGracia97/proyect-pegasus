import { 
  LucideAngularModule, 
  Music, 
  Video, 
  Image, 
  Youtube, 
  FileText, 
  Database, 
  Sparkles,
  RefreshCw 
} from 'lucide-angular';
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioConvertComponent } from './components/audio-convert/audio-convert.component';
import { VideoConvertComponent } from './components/video-convert/video-convert.component';
import { YtConvertComponent } from './components/yt-convert/yt-convert.component';
export type ActiveTool = 'audio' | 'video' | 'images' | 'youtube' | 'documents' | 'data' | null;

@Component({
  selector: 'app-tools',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    AudioConvertComponent,
    VideoConvertComponent,
    YtConvertComponent
  ],
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.scss']
  //styleUrls: ['./tools.component.scss', './tools.responsive.scss']
})
export class ToolsComponent {
  activeTool = signal<ActiveTool>(null);

  // Mapeo de íconos para el centro
  icons = {
    audio: Music,
    video: Video,
    images: Image,
    youtube: Youtube,
    documents: FileText,
    data: Database,
    default: RefreshCw
  };

  toolsList = [
    { id: 'audio' as ActiveTool, name: 'Convertidor de Audio', icon: Music },
    { id: 'video' as ActiveTool, name: 'Convertidor de Video', icon: Video },
    { id: 'images' as ActiveTool, name: 'Convertidor de Imágenes', icon: Image },
    { id: 'youtube' as ActiveTool, name: 'Convertidor de Youtube', icon: Youtube },
    { id: 'documents' as ActiveTool, name: 'Convertidor de Documentos', icon: FileText },
    { id: 'data' as ActiveTool, name: 'Convertidor de Datos', icon: Database }
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