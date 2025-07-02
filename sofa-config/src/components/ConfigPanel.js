import React, { useState, useEffect } from 'react';

const ConfigPanel = ({ modelData, onPositionChange, onColorChange, onMaterialChange, onWireframeChange, onOpenMaterialConfig }) => {
  const [yRotation, setYRotation] = useState(modelData.rotation[1]);

  useEffect(() => {
    setYRotation(modelData.rotation[1]);
    // Add more state updates here if you want to sync more data from modelData
  }, [modelData]);
  
  const handleYRotationChange = (e) => {
    const value = parseFloat(e.target.value);
    setYRotation(value);
    onPositionChange('y', value);
  };

  return (
    <div className="config-panel">
      <h2>Configuration</h2>
      <div className="control-group">
        <div className="control-row">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={!!modelData.wireframe}
              onChange={e => onWireframeChange(e.target.checked)}
            />
            Wireframe
          </label>
        </div>
      </div>
      
      <div className="control-group">
        <h3>Rotation</h3>
        
        
        <div className="control-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
            <label>Y:</label>
            <input 
              type="range" 
              min="-3.14" 
              max="3.14" 
              step="0.01"
              value={yRotation}
              onChange={handleYRotationChange}
              style={{ flex: 1 }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <input
              type="number"
              min="-3.14"
              max="3.14"
              step="0.01"
              value={yRotation}
              onChange={handleYRotationChange}
              style={{
                width: '60px',
                padding: '4px 8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                background: '#f9f9f9',
                fontSize: '1em',
                outline: 'none',
                transition: 'border 0.2s',
              }}
            />
            <span>{yRotation.toFixed(2)}</span>
          </div>
        </div>
        
        
      </div>
      
      <div className="control-group">
        <h3>Color</h3>
        <div className="color-picker">
          <input 
            type="color" 
            value={modelData.color}
            onChange={(e) => onColorChange(e.target.value)}
          />
        </div>
      </div>

      <div className="control-group">
        <h3>Material</h3>
        <div className="control-row">
          <select value={modelData.material || 'MeshStandardMaterial'} onChange={e => onMaterialChange(e.target.value)}>
            <option value="MeshStandardMaterial">Standard</option>
            <option value="MeshPhongMaterial">MeshPhongMaterial</option>
            <option value="MeshPhysicalMaterial">MeshPhysicalMaterial</option>
          </select>
          <button
            type="button"
            className="config-panel-button"
            onClick={() => onOpenMaterialConfig(modelData.material, modelData.materialProps || {})}
          >
            Configure Material
          </button>
        </div>
      </div>

     
    </div>
  );
};

export default ConfigPanel;