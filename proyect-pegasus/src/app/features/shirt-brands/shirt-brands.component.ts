import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js';

interface ProductModel {
  id: string;
  name: string;
  path: string;
  scale: number;
}

@Component({
  selector: 'app-shirt-brands',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shirt-brands.component.html',
  styleUrl: './shirt-brands.component.scss'
})
export class ShirtBrandsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('rendererCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  availableModels: ProductModel[] = [
    { id: 't-shirt', name: 'Camiseta Básica', path: 'assets/3d/T-Shirt.glb', scale: 1.0 },
    { id: 't-shirt-folded', name: 'Camiseta Doblada', path: 'assets/3d/T-Shirt_folded.glb', scale: 1.0 },
    { id: 'jacket', name: 'Chaqueta / Manga Larga', path: 'assets/3d/Jacket.glb', scale: 0.9 },
    { id: 'cap', name: 'Gorra', path: 'assets/3d/Cap.glb', scale: 1.1 }
  ];

  selectedModelId: string = 't-shirt';
  shirtColor: string = '#ffffff';
  logoPreviewUrl: string | null = null;
  savedCaptureUrl: string | null = null;
  
  // Ajustes de Sublimado
  logoScale: number = 0.3;
  logoPosY: number = 0.05;
  logoPosX: number = 0.0;

  // Variables 3D de Three.js
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;

  private currentLoadedGroup: THREE.Group = new THREE.Group();
  private mainMesh?: THREE.Mesh;
  private decalMesh?: THREE.Mesh;
  private logoTexture?: THREE.Texture;
  private animationFrameId?: number;
  private resizeObserver?: ResizeObserver;

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.setupResizeObserver();
    this.loadSelectedModel();
    this.animate();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.renderer?.dispose();
  }

  private initThreeJS(): void {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.parentElement?.clientWidth || 600;
    const height = 500;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a101d);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 2.8);

    this.renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true, 
      alpha: true,
      preserveDrawingBuffer: true // Permite tomar captura de pantalla en el Front
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.8);
    mainLight.position.set(2, 4, 3);
    this.scene.add(mainLight);

    const accentLight = new THREE.DirectionalLight(0x00d2ff, 0.6);
    accentLight.position.set(-2, -1, -2);
    this.scene.add(accentLight);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.maxDistance = 5;
    this.controls.minDistance = 1.0;

    this.scene.add(this.currentLoadedGroup);
  }

  // Ajuste Responsivo para evitar distorsiones al redimensionar la pantalla
  private setupResizeObserver(): void {
    const container = this.canvasRef.nativeElement.parentElement;
    if (!container) return;

    this.resizeObserver = new ResizeObserver(() => {
      const width = container.clientWidth;
      const height = 500;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);
    });

    this.resizeObserver.observe(container);
  }

  loadSelectedModel(): void {
    const config = this.availableModels.find(m => m.id === this.selectedModelId) || this.availableModels[0];

    while (this.currentLoadedGroup.children.length > 0) {
      const obj = this.currentLoadedGroup.children[0];
      this.currentLoadedGroup.remove(obj);
    }
    this.mainMesh = undefined;

    const loader = new GLTFLoader();
    loader.load(
      config.path,
      (gltf) => {
        const model = gltf.scene;

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());

        model.position.x += (model.position.x - center.x);
        model.position.y += (model.position.y - center.y);
        model.position.z += (model.position.z - center.z);

        model.scale.set(config.scale, config.scale, config.scale);

        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (!this.mainMesh) {
              this.mainMesh = mesh;
            }
            if (mesh.material) {
              (mesh.material as THREE.MeshStandardMaterial).color = new THREE.Color(this.shirtColor);
            }
          }
        });

        this.currentLoadedGroup.add(model);

        if (this.controls) {
          this.controls.target.set(0, 0, 0);
          this.controls.update();
        }

        if (this.logoTexture) {
          this.updateLogoMesh();
        }
      },
      undefined,
      (err) => console.error('Error al cargar modelo 3D:', config.path, err)
    );
  }

  onColorChange(colorHex: string): void {
    this.shirtColor = colorHex;
    if (this.currentLoadedGroup) {
      this.currentLoadedGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material) {
            (mesh.material as THREE.MeshStandardMaterial).color.set(colorHex);
          }
        }
      });
    }
  }

  onFileUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.logoPreviewUrl = e.target.result;
      this.applyLogoToShirt(this.logoPreviewUrl!);
    };
    reader.readAsDataURL(file);
  }

  private applyLogoToShirt(imageUrl: string): void {
    const loader = new THREE.TextureLoader();
    loader.load(imageUrl, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      this.logoTexture = texture;
      this.updateLogoMesh();
    });
  }

  updateLogoMesh(): void {
    if (!this.logoTexture || !this.mainMesh) return;

    if (this.decalMesh) {
      this.scene.remove(this.decalMesh);
      this.decalMesh.geometry.dispose();
    }

    const position = new THREE.Vector3(this.logoPosX, this.logoPosY, 0.2);
    const orientation = new THREE.Euler(0, 0, 0);
    const size = new THREE.Vector3(this.logoScale, this.logoScale, 0.5);

    const decalGeometry = new DecalGeometry(this.mainMesh, position, orientation, size);

    const decalMaterial = new THREE.MeshStandardMaterial({
      map: this.logoTexture,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      roughness: 0.8
    });

    this.decalMesh = new THREE.Mesh(decalGeometry, decalMaterial);
    this.scene.add(this.decalMesh);
  }

  // Simulación de Guardado únicamente en Frontend
  saveFrontMockup(): void {
    // Forzar un renderizado previo a la captura
    this.renderer.render(this.scene, this.camera);
    
    // Generar captura PNG directamente desde el Canvas
    const dataUrl = this.canvasRef.nativeElement.toDataURL('image/png');
    this.savedCaptureUrl = dataUrl;

    // Crear descarga simulada para el usuario
    const link = document.createElement('a');
    link.download = `area7-diseno-${this.selectedModelId}.png`;
    link.href = dataUrl;
    link.click();
  }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };
}