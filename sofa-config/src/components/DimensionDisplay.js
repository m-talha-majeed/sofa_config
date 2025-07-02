import React from 'react';

const DimensionDisplay = ({ dimensions, model }) => {
  const dim = dimensions[model] || { x: 0, y: 0, z: 0 };
  
  return (
    <div className="dimension-display">
      <h3>Dimensions</h3>
      <div className="dimension-row">
        <span>Length (X):</span>
        <span>{dim.x} m</span>
      </div>
      <div className="dimension-row">
        <span>Height (Y):</span>
        <span>{dim.y} m</span>
      </div>
      <div className="dimension-row">
        <span>Depth (Z):</span>
        <span>{dim.z} m</span>
      </div>
      <div className="dimension-row">
        <span>Volume:</span>
        <span>{(dim.x * dim.y * dim.z).toFixed(3)} m³</span>
      </div>
    </div>
  );
};

export default DimensionDisplay;