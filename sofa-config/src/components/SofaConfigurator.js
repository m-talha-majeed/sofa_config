// SofaConfigurator.js
import React, { useState, useRef } from 'react';
import ThreeScene from './ThreeScene';
import ConfigPanel from './ConfigPanel';
import { FaCog } from 'react-icons/fa';
import sofaImg from './assets/sofa.png';
import cornerSofaImg from './assets/sofa_corner.png';
import ModelSelector from './ModelSelector';

const SofaConfigurator = () => {
  // State
  const [models, setModels] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [showConfig, setShowConfig] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [autoRotate, setAutoRotate] = useState(false);
  const sceneRef = useRef(null);

  // Derived data
  const selectedModel = models.find(m => m.id === selectedModelId) || null;

  // --- Helper functions ---
  const getSofaCount = () => models.filter(m => m.type === 'sofa').length;
  const getCornerSofaCount = () => models.filter(m => m.type === 'corner').length;

  // --- Model management ---
  const addSofa = () => {
    const offset = 0.8 * getSofaCount();
    const newSofa = {
      id: Date.now(),
      type: 'sofa',
      position: [offset, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: '#8B4513',
      material: 'Fabric',
    };
    setModels([...models, newSofa]);
    setSelectedModelId(newSofa.id);
  };

  const addCornerSofa = () => {
    const offset = -0.9 * (getCornerSofaCount() + 1);
    const newCornerSofa = {
      id: Date.now(),
      type: 'corner',
      position: [offset, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: '#8B4513',
      material: 'Fabric',
    };
    setModels([...models, newCornerSofa]);
    setSelectedModelId(newCornerSofa.id);
  };

  const updateModel = (id, updates) => {
    setModels(prevModels =>
      prevModels.map(model =>
        model.id === id ? { ...model, ...updates } : model
      )
    );
  };

  // --- Model property updaters ---
  const updateModelPosition = (id, position) => {
    updateModel(id, { position });
  };

  const updateModelRotation = (id, axis, value) => {
    const model = models.find(m => m.id === id);
    if (!model) return;
    const newRotation = [...model.rotation];
    newRotation[['x', 'y', 'z'].indexOf(axis)] = parseFloat(value);
    updateModel(id, { rotation: newRotation });
  };

  const updateModelColor = (id, color) => {
    updateModel(id, { color });
    if (sceneRef.current) {
      sceneRef.current.updateMaterialColor(id, color);
    }
  };

  const updateModelMaterial = (id, material) => {
    updateModel(id, { material });
  };

  const updateModelWireframe = (id, wireframe) => {
    updateModel(id, { wireframe });
    if (sceneRef.current) {
      sceneRef.current.updateModelWireframe(id, wireframe);
    }
  };

  // Update materialProps for a model
  const updateModelMaterialProps = (id, materialProps) => {
    updateModel(id, { materialProps });
  };

  const handleDeleteModel = (id) => {
    setModels(models.filter(m => m.id !== id));
    if (selectedModelId === id) {
      setSelectedModelId(models.length > 1 ? models.find(m => m.id !== id)?.id : null);
    }
  };

  // --- Render ---
  return (
    <div className="configurator-container">
      <div className="scene-container">
        <ThreeScene 
          ref={sceneRef}
          models={models}
          onModelPositionChange={updateModelPosition}
          backgroundColor={backgroundColor}
          setSelectedModel={setSelectedModelId}
          autoRotate={autoRotate}
          onUpdateModelMaterialProps={updateModelMaterialProps}
        />
        <button 
          className="config-toggle-button"
          onClick={() => setShowConfig(!showConfig)}
        >
          <FaCog className="config-icon" />
        </button>
      </div>
      {showConfig && (
        <div className="config-overlay">
          <div className="overlay-header">
            <h2>Sofa Configurator</h2>
            <button 
              className="close-button"
              onClick={() => setShowConfig(false)}
            >
              &times;
            </button>
          </div>
          <div className="background-color-group">
            <div className="control-group">
              <div className="control-row">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#b71c1c' }}>
                  <input
                    type="checkbox"
                    checked={autoRotate}
                    onChange={e => setAutoRotate(e.target.checked)}
                  />
                  Auto Rotate
                </label>
              </div>
            </div>
            <div className="control-group">
              <h3 style={{ color: '#b71c1c' }}>Background Color</h3>
              <div className="color-picker">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={e => setBackgroundColor(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="overlay-content">
            <div className="model-selector">
              <button onClick={addSofa}>
                <img src={sofaImg} alt="Sofa" className="button-image" />
                Add Sofa
              </button>
              <button onClick={addCornerSofa}>
                <img src={cornerSofaImg} alt="Corner Sofa" className="button-image" />
                Add Corner Sofa
              </button>
            </div>
            {selectedModel && (
              <ConfigPanel
                key={selectedModel.id}
                modelData={selectedModel}
                onPositionChange={(axis, value) => updateModelRotation(selectedModel.id, axis, value)}
                onColorChange={(color) => updateModelColor(selectedModel.id, color)}
                onMaterialChange={(material) => updateModelMaterial(selectedModel.id, material)}
                onWireframeChange={(wireframe) => updateModelWireframe(selectedModel.id, wireframe)}
                onOpenMaterialConfig={(materialType, materialProps) => {
                  if (sceneRef.current && sceneRef.current.openMaterialConfigForModel) {
                    sceneRef.current.openMaterialConfigForModel(selectedModel.id, materialType, materialProps);
                  }
                }}
              />
            )}
            <ModelSelector
              models={models}
              selectedModelId={selectedModelId}
              onSelectModel={setSelectedModelId}
              onDeleteModel={handleDeleteModel}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SofaConfigurator;