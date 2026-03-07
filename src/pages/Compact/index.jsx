import React from 'react';
import { FiMoreVertical } from 'react-icons/fi';
import './Compact.scss';

const ITEMS = [
  'Marine Port calls',
  'Crew Change / Material Supply',
  'L & T Marine and Crew workflow',
];

export default function Compact() {
  return (
    <div className="compact-page">
      <div className="compact-list">
        {ITEMS.map((label, index) => (
          <div key={index} className="compact-list-item">
            <span className="compact-list-item-text">{label}</span>
            <button
              type="button"
              className="compact-list-item-kebab"
              aria-label="More options"
            >
              <FiMoreVertical size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
