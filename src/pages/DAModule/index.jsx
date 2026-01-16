import { useState, useCallback } from "react";
import "./DAModule.scss";

// Initial data for DA Module with 4 columns
const createDAModuleData = () => {
  const columns = [
    {
      id: "da-col-1",
      title: "Column 1",
      items: [],
      color: "#E2106C", // Pink
    },
    {
      id: "da-col-2",
      title: "Column 2",
      items: [],
      color: "#7915BC", // Purple
    },
    {
      id: "da-col-3",
      title: "Column 3",
      items: [],
      color: "#3E5EBD", // Blue
    },
    {
      id: "da-col-4",
      title: "Column 4",
      items: [],
      color: "#41B24A", // Green
    },
  ];

  return columns;
};

export default function DAModule() {
  const [columns, setColumns] = useState(createDAModuleData());

  const handleAddItem = useCallback((columnId) => {
    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === columnId) {
          const newItem = {
            id: `item-${Date.now()}-${Math.random()}`,
            title: `New Item ${col.items.length + 1}`,
            createdAt: new Date().toISOString(),
          };
          return {
            ...col,
            items: [...col.items, newItem],
          };
        }
        return col;
      })
    );
  }, []);

  const handleDeleteItem = useCallback((columnId, itemId) => {
    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === columnId) {
          return {
            ...col,
            items: col.items.filter((item) => item.id !== itemId),
          };
        }
        return col;
      })
    );
  }, []);

  return (
    <div className="da-module-wrapper">
      {/* Header Section */}
      <div className="da-module-header">
        <div className="da-module-header-content">
          <h1 className="da-module-title">DA Module</h1>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="da-module-content">
        <div className="da-module-columns-container">
          {columns.map((column) => (
            <div key={column.id} className="da-module-column">
              {/* Column Header */}
              <div
                className="da-module-column-header"
                style={{ borderTopColor: column.color }}
              >
                <div className="da-module-column-header-left">
                  <div
                    className="da-module-column-indicator"
                    style={{ backgroundColor: column.color }}
                  ></div>
                  <h2 className="da-module-column-title">{column.title}</h2>
                </div>
                <div className="da-module-column-count">{column.items.length}</div>
              </div>

              {/* Column Body */}
              <div className="da-module-column-body">
                {column.items.length === 0 ? (
                  <div className="da-module-empty-state">
                    <p>No items yet</p>
                  </div>
                ) : (
                  <div className="da-module-items-list">
                    {column.items.map((item) => (
                      <div key={item.id} className="da-module-item">
                        <div className="da-module-item-content">
                          <p className="da-module-item-title">{item.title}</p>
                        </div>
                        <button
                          className="da-module-item-delete"
                          onClick={() => handleDeleteItem(column.id, item.id)}
                          aria-label="Delete item"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Item Button */}
                <button
                  className="da-module-add-item-btn"
                  onClick={() => handleAddItem(column.id)}
                >
                  <span className="da-module-add-icon">+</span>
                  <span>Add Item</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
