import React from 'react';
import PropTypes from 'prop-types';

const defaultProps = {
  MeshPhongMaterial: { shininess: 30, specular: '#111111', emissive: '#000000' },
  MeshPhysicalMaterial: { metalness: 0.5, roughness: 0.5, transmission: 0, clearcoat: 0 },
};

function MaterialConfig({ materialType, materialProps, onChange, onClose }) {
  if (!materialType) return null;
  const props = { ...defaultProps[materialType], ...materialProps };

  const handleChange = (key, value) => {
    onChange({ ...props, [key]: value });
  };

  return (
    <div className="material-config-bar">
      <div className="material-config-card slimmer">
        <form className="material-config-form" onSubmit={e => e.preventDefault()}>
          {materialType === 'MeshPhongMaterial' && (
            <>
              <label>Shininess
                <input type="number" min={0} max={100} value={props.shininess} onChange={e => handleChange('shininess', Number(e.target.value))} />
              </label>
              <label>Specular
                <div className="color-picker">
                  <input type="color" value={props.specular} onChange={e => handleChange('specular', e.target.value)} />
                </div>
              </label>
              <label>Emissive
                <div className="color-picker">
                  <input type="color" value={props.emissive} onChange={e => handleChange('emissive', e.target.value)} />
                </div>
              </label>
            </>
          )}
          {materialType === 'MeshPhysicalMaterial' && (
            <>
              <label>Metalness
                <input type="number" min={0} max={1} step={0.01} value={props.metalness} onChange={e => handleChange('metalness', Number(e.target.value))} />
              </label>
              <label>Roughness
                <input type="number" min={0} max={1} step={0.01} value={props.roughness} onChange={e => handleChange('roughness', Number(e.target.value))} />
              </label>
              <label>Transmission
                <input type="number" min={0} max={1} step={0.01} value={props.transmission} onChange={e => handleChange('transmission', Number(e.target.value))} />
              </label>
              <label>Clearcoat
                <input type="number" min={0} max={1} step={0.01} value={props.clearcoat} onChange={e => handleChange('clearcoat', Number(e.target.value))} />
              </label>
            </>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" onClick={onClose}>Close</button>
          </div>
        </form>
      </div>
    </div>
  );
}

MaterialConfig.propTypes = {
  materialType: PropTypes.string,
  materialProps: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default MaterialConfig; 