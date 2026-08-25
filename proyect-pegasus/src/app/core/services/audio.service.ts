import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

declare var YT: any;

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private player: any;
  private isSdkLoaded = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.initYouTubeSdk();
  }

  private initYouTubeSdk(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if ((window as any).YT && (window as any).YT.Player) {
      this.isSdkLoaded = true;
      return;
    }

    // Insertar script de YouTube de manera asíncrona
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    (window as any).onYouTubeIframeAPIReady = () => {
      this.isSdkLoaded = true;
    };
  }

  public loadPlayer(elementId: string, videoId: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.isSdkLoaded && (window as any).YT && YT.Player) {
      this.createPlayer(elementId, videoId);
    } else {
      const checkInterval = setInterval(() => {
        if ((window as any).YT && YT.Player) {
          clearInterval(checkInterval);
          this.isSdkLoaded = true;
          this.createPlayer(elementId, videoId);
        }
      }, 100);
    }
  }

  private createPlayer(elementId: string, videoId: string): void {
    this.player = new YT.Player(elementId, {
      height: '0',
      width: '0',
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        rel: 0
      },
      events: {
        onReady: () => {
          console.log('Reproductor de Audio persistente listo.');
        }
      }
    });
  }

  public play(): void {
    if (this.player && typeof this.player.playVideo === 'function') {
      this.player.playVideo();
    }
  }

  public stop(): void {
    if (this.player && typeof this.player.stopVideo === 'function') {
      this.player.stopVideo();
    }
  }

  public destroyPlayer(): void {
    if (this.player && typeof this.player.destroy === 'function') {
      this.player.destroy();
    }
  }
}