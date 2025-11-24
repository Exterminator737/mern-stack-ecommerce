import React, { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';

const ProductAttributeEditor = ({ specifications, onChange }) => {
  const [newSpec, setNewSpec] = useState({
    label: '',
    value: '',
    type: 'text'
  });

  const handleAdd = () => {
    if (!newSpec.label || !newSpec.value) return;
    
    const updated = [...(specifications || []), newSpec];
    onChange(updated);
    setNewSpec({ label: '', value: '', type: 'text' });
  };

  const handleDelete = (index) => {
    const updated = specifications.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleMove = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === specifications.length - 1) return;

    const updated = [...specifications];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  const handleChange = (index, field, value) => {
    const updated = [...specifications];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4 border rounded-md p-4 bg-gray-50">
      <h4 className="font-medium text-gray-900">Product Specifications</h4>
      
      {/* Add New Attribute */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end bg-white p-3 rounded border border-gray-200">
        <div className="md:col-span-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">Label</label>
          <input
            type="text"
            placeholder="e.g. Color"
            className="block w-full text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            value={newSpec.label}
            onChange={(e) => setNewSpec({ ...newSpec, label: e.target.value })}
          />
        </div>
        <div className="md:col-span-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
          <select
            className="block w-full text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            value={newSpec.type}
            onChange={(e) => setNewSpec({ ...newSpec, type: e.target.value })}
          >
            <option value="text">Text</option>
            <option value="list">List (Bullet)</option>
            <option value="boolean">Yes/No</option>
            <option value="number">Number</option>
            <option value="link">Link</option>
          </select>
        </div>
        <div className="md:col-span-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">Value</label>
          {newSpec.type === 'boolean' ? (
            <select
              className="block w-full text-sm border-gray-300 rounded-md"
              value={newSpec.value}
              onChange={(e) => setNewSpec({ ...newSpec, value: e.target.value === 'true' })}
            >
              <option value="">Select...</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          ) : (
            <input
              type="text"
              placeholder="Value"
              className="block w-full text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              value={newSpec.value}
              onChange={(e) => setNewSpec({ ...newSpec, value: e.target.value })}
            />
          )}
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newSpec.label || (!newSpec.value && newSpec.type !== 'boolean')}
          className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none disabled:opacity-50"
        >
          <Plus className="h-4 w-4 mr-1" /> Add
        </button>
      </div>

      {/* List Attributes */}
      <div className="space-y-2">
        {specifications && specifications.map((spec, index) => (
          <div key={index} className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200 group">
             <div className="flex flex-col gap-1 text-gray-400">
               <button type="button" onClick={() => handleMove(index, 'up')} disabled={index === 0} className="hover:text-gray-700 disabled:opacity-30">
                 <ArrowUp className="h-3 w-3" />
               </button>
               <button type="button" onClick={() => handleMove(index, 'down')} disabled={index === specifications.length - 1} className="hover:text-gray-700 disabled:opacity-30">
                 <ArrowDown className="h-3 w-3" />
               </button>
             </div>
             
             <div className="grid grid-cols-3 gap-2 flex-1">
               <input
                 type="text"
                 value={spec.label}
                 onChange={(e) => handleChange(index, 'label', e.target.value)}
                 className="text-sm border-gray-200 rounded focus:ring-primary-500 focus:border-primary-500 font-medium"
               />
               <div className="text-xs text-gray-500 flex items-center px-2 bg-gray-50 rounded border border-gray-100">
                 {spec.type}
               </div>
               {spec.type === 'boolean' ? (
                  <select
                    value={spec.value.toString()}
                    onChange={(e) => handleChange(index, 'value', e.target.value === 'true')}
                    className="text-sm border-gray-200 rounded focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
               ) : (
                 <input
                   type="text"
                   value={spec.value}
                   onChange={(e) => handleChange(index, 'value', e.target.value)}
                   className="text-sm border-gray-200 rounded focus:ring-primary-500 focus:border-primary-500"
                 />
               )}
             </div>

             <button 
               type="button" 
               onClick={() => handleDelete(index)}
               className="text-gray-400 hover:text-red-500 p-1"
             >
               <Trash2 className="h-4 w-4" />
             </button>
          </div>
        ))}
        {(!specifications || specifications.length === 0) && (
          <div className="text-center text-gray-500 text-sm py-4 italic">
            No specifications added yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductAttributeEditor;
