import React, { useEffect } from 'react';

const ModelSelector = ({ models, selectedModelId, onSelectModel, onDeleteModel }) => {
  useEffect(() => {
    // This effect runs whenever selectedModelId changes
  }, [selectedModelId]);

  return (
    <div className="model-list">
      <h3>Placed Models</h3>
      {models.map(model => (
        <div 
          key={model.id} 
          className={`model-item ${selectedModelId === model.id ? 'selected' : ''}`}
          onClick={() => onSelectModel(model.id)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div style={{ flex: 1 }}>
            <div>{model.type === 'sofa' ? 'Sofa' : 'Corner Sofa'}</div>
            <div style={{ fontSize: '0.85em', color: '#cbcbcb', marginTop: 2 }}>(ID: {model.id})</div>
          </div>
          <button 
            className="delete-button"
            onClick={e => {
              e.stopPropagation();
              onDeleteModel(model.id);
            }}
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
};

export default ModelSelector; 