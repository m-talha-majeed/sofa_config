// ThreeScene.js
import React, { forwardRef, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import MaterialConfig from './MaterialConfig';

// Main 3D scene component
const ThreeScene = forwardRef(({
  models,
  onModelPositionChange,
  backgroundColor = '#AA8888',
  setSelectedModel,
  autoRotate,
  onUpdateModelMaterialProps
}, ref) => {
  // --- Refs ---
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const animationFrameId = useRef(null);
  const modelRefs = useRef({});
  const sofaModelRef = useRef(null);
  const cornerSofaModelRef = useRef(null);
  const isDraggingRef = useRef(false);
  const selectedObjectRef = useRef(null);
  const offsetRef = useRef(new THREE.Vector3());
  const dragPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const sofaModelsRef = useRef([]);
  const floorRef = useRef(null);
  const [materialConfigOpen, setMaterialConfigOpen] = React.useState(false);
  const [materialConfigType, setMaterialConfigType] = React.useState(null);
  const [materialConfigProps, setMaterialConfigProps] = React.useState({});
  const [materialConfigModelId, setMaterialConfigModelId] = React.useState(null);

  // --- Expose imperative methods to parent ---
  React.useImperativeHandle(ref, () => ({
    updateMaterialColor: (id, color) => {
      const model = modelRefs.current[id];
      if (!model) return;
      model.traverse(child => {
        if (child.isMesh) {
          child.material.color.set(color);
        }
      });
    },
    getModelRefs: () => modelRefs.current,
    updateModelWireframe: (id, wireframe) => {
      const model = modelRefs.current[id];
      if (!model) return;
      model.traverse(child => {
        if (child.isMesh) {
          child.material.wireframe = !!wireframe;
        }
      });
    },
    openMaterialConfigForModel: (modelId, materialType, materialProps) => {
      openMaterialConfig(modelId, materialType, materialProps);
    },
  }));

  // --- Mouse Event Handlers ---
  const onMouseDown = (event) => {
    mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(sofaModelsRef.current, true);
    if (intersects.length > 0) {
      let obj = intersects[0].object;
      while (obj.parent && !sofaModelsRef.current.includes(obj)) {
        obj = obj.parent;
      }
      if (sofaModelsRef.current.includes(obj)) {
        if (setSelectedModel) {
          const id = obj.userData.id;
          setSelectedModel(id);
        }
        controlsRef.current.enabled = false;
        isDraggingRef.current = true;
        selectedObjectRef.current = obj;
        const intersectPoint = new THREE.Vector3();
        raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, intersectPoint);
        offsetRef.current.copy(obj.position).sub(intersectPoint);
      }
    }
  };

  const onMouseMove = (event) => {
    if (isDraggingRef.current && selectedObjectRef.current) {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersectPoint = new THREE.Vector3();
      if (raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, intersectPoint)) {
        const newPos = intersectPoint.clone().add(offsetRef.current);
        newPos.y = 0;
        if (!isColliding(selectedObjectRef.current, newPos)) {
          selectedObjectRef.current.position.copy(newPos);
        }
      }
    }
  };

  const onMouseUp = () => {
    if (isDraggingRef.current && selectedObjectRef.current) {
      controlsRef.current.enabled = true;
      isDraggingRef.current = false;
      const id = selectedObjectRef.current.userData.id;
      const position = selectedObjectRef.current.position;
      if (onModelPositionChange) {
        onModelPositionChange(id, [position.x, position.y, position.z]);
      }
      selectedObjectRef.current = null;
    }
  };

  // --- Scene Initialization and Animation ---
  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);
    sceneRef.current = scene;
    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 3);
    cameraRef.current = camera;
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    const mountNode = mountRef.current;
    if (mountNode) {
      while (mountNode.firstChild) mountNode.removeChild(mountNode.firstChild);
      mountNode.appendChild(renderer.domElement);
    }
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = !!autoRotate;
    controlsRef.current = controls;
    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    // Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshStandardMaterial({ color: backgroundColor, side: THREE.DoubleSide })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    floorRef.current = floor;
    // Grid
    const gridHelper = new THREE.GridHelper(10, 30, 0x000000, 0xd3d3d3);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);
    // Loaders
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    dracoLoader.setDecoderConfig({ type: 'js' });
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);
    gltfLoader.load('./assets/sofa.glb', (gltf) => {
      sofaModelRef.current = gltf.scene;
      renderModels();
    });
    gltfLoader.load('./assets/sofa_corner.glb', (gltf) => {
      cornerSofaModelRef.current = gltf.scene;
      renderModels();
    });
    // Animation
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      models.forEach(model => {
        const modelObj = modelRefs.current[model.id];
        if (modelObj && modelObj !== selectedObjectRef.current) {
          modelObj.position.set(...model.position);
          modelObj.rotation.set(...model.rotation);
        }
      });
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    // Events
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId.current);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      if (rendererRef.current) rendererRef.current.dispose();
      if (controlsRef.current) controlsRef.current.dispose();
      if (mountNode && mountNode.contains(renderer.domElement)) {
        mountNode.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- React to Prop Changes ---
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(backgroundColor);
    }
    if (floorRef.current) {
      floorRef.current.material.color.set(backgroundColor);
    }
  }, [backgroundColor]);

  useEffect(() => {
    renderModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [models]);

  // Update autoRotate on controls when prop changes
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = !!autoRotate;
    }
  }, [autoRotate]);

  // --- Helper Functions ---
  const isColliding = (obj, newPosition) => {
    const clone = obj.clone();
    clone.position.copy(newPosition);
    const tempBox = new THREE.Box3().setFromObject(clone);
    if (
      tempBox.min.x < -5 || tempBox.max.x > 5 ||
      tempBox.min.z < -5 || tempBox.max.z > 5
    ) {
      return true;
    }
    for (const other of sofaModelsRef.current) {
      if ((other !== obj && other.name !== "Floor")) {
        const otherBox = new THREE.Box3().setFromObject(other);
        if (tempBox.intersectsBox(otherBox)) {
          return true;
        }
      }
    }
    return false;
  };

  // Function to open material config for a model
  const openMaterialConfig = (modelId, materialType, currentProps = {}) => {
    setMaterialConfigModelId(modelId);
    setMaterialConfigType(materialType);
    setMaterialConfigProps(currentProps);
    setMaterialConfigOpen(true);
  };

  // Function to handle material config change
  const handleMaterialConfigChange = (newProps) => {
    setMaterialConfigProps(newProps);
    if (materialConfigModelId && typeof onUpdateModelMaterialProps === 'function') {
      onUpdateModelMaterialProps(materialConfigModelId, newProps);
    }
  };

  // Function to save material config
  const handleMaterialConfigSave = () => {
    if (materialConfigModelId && materialConfigType) {
      // Update the model's materialProps in the parent (models array)
      if (typeof window.updateModelMaterialProps === 'function') {
        window.updateModelMaterialProps(materialConfigModelId, materialConfigProps);
      }
    }
    setMaterialConfigOpen(false);
  };

  // Render all models in the scene
  const renderModels = () => {
    const needsSofa = models.some(m => m.type === 'sofa');
    const needsCorner = models.some(m => m.type === 'corner');
    if ((needsSofa && !sofaModelRef.current) || (needsCorner && !cornerSofaModelRef.current)) {
      return;
    }
    const scene = sceneRef.current;
    if (!scene) return;
    Object.values(modelRefs.current).forEach(model => {
      scene.remove(model);
    });
    modelRefs.current = {};
    sofaModelsRef.current = [];
    models.forEach(model => {
      const sourceModel = model.type === 'sofa' 
        ? sofaModelRef.current 
        : cornerSofaModelRef.current;
      if (sourceModel) {
        const modelClone = sourceModel.clone();
        modelRefs.current[model.id] = modelClone;
        sofaModelsRef.current.push(modelClone);
        modelClone.userData = { id: model.id };
        modelClone.position.set(...model.position);
        modelClone.rotation.set(...model.rotation);
        let roughness = 0.8, metalness = 0.1;
        if (model.material === 'Leather') {
          roughness = 0.4; metalness = 0.6;
        } else if (model.material === 'Velvet') {
          roughness = 0.9; metalness = 0.05;
        }
        // Use materialProps if present
        const matProps = model.materialProps || {};
        modelClone.traverse(child => {
          if (child.isMesh) {
            let material;
            switch (model.material) {
              case 'MeshPhongMaterial':
                material = new THREE.MeshPhongMaterial({ color: model.color, wireframe: !!model.wireframe, ...matProps });
                break;
              case 'MeshPhysicalMaterial':
                material = new THREE.MeshPhysicalMaterial({ color: model.color, wireframe: !!model.wireframe, ...matProps });
                break;
              case 'MeshStandardMaterial':
              default:
                material = new THREE.MeshStandardMaterial({
                  color: model.color,
                  roughness,
                  metalness,
                  wireframe: !!model.wireframe,
                  ...matProps
                });
                break;
            }
            child.material = material;
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        scene.add(modelClone);
      }
    });
  };

  // --- Render ---
  return <>
    <div ref={mountRef} className="three-scene" />
    {materialConfigOpen && (
      <MaterialConfig
        materialType={materialConfigType}
        materialProps={materialConfigProps}
        onChange={handleMaterialConfigChange}
        onClose={() => setMaterialConfigOpen(false)}
      />
    )}
  </>;
});

export default ThreeScene;