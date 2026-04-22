import PropTypes from "prop-types";
import { useEffect, useRef } from "react";
import ChecklistItemRow from "./ChecklistItemRow";
import { countNodeItems, countNodeCompleted } from "./checklistMappers";

const ChecklistItemsTable = ({ items, itemsData, onItemChange, cardColor, isViewOnly, isDAModule }) => (
  <div className="checklist-items-table-wrapper checklist-table-card cl-items-table-wrap">
    <table className="checklist-items-table cl-items-table cl-items-table--4col">
      <colgroup>
        <col className="checklist-col-check cl-col-check" />
        <col className="cl-col-item" />
        <col className="cl-col-upload" />
        <col className="cl-col-remarks" />
      </colgroup>
      <thead>
        <tr>
          <th className="checklist-table-checkbox-header">Done</th>
          <th className="checklist-table-label-header">Item</th>
          <th className="checklist-table-upload-header">Document upload</th>
          <th className="checklist-table-remarks-header">Remarks</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <ChecklistItemRow
            key={item.id}
            item={item}
            itemData={itemsData[item.id] || {}}
            onChange={onItemChange}
            cardColor={cardColor}
            isViewOnly={isViewOnly}
            isDAModule={isDAModule}
          />
        ))}
      </tbody>
    </table>
  </div>
);

ChecklistItemsTable.propTypes = {
  items: PropTypes.array.isRequired,
  itemsData: PropTypes.object.isRequired,
  onItemChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
  isViewOnly: PropTypes.bool,
  isDAModule: PropTypes.bool,
};

const ChecklistSectionNode = ({
  node,
  itemsData,
  onItemChange,
  openSections,
  onSectionToggle,
  onSelectAll,
  cardColor = "#2A00FF",
  isViewOnly = false,
  isDAModule = false,
  depth = 0,
}) => {
  const isSub = depth > 0;
  const isOpen = openSections[node.id] !== false;
  const total = countNodeItems(node);
  const done = countNodeCompleted(node, itemsData);
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const allSelected =
    total > 0
    && nodeItemsEveryUploaded(node, itemsData);
  const someSelected = nodeItemsSomeUploaded(node, itemsData) && !allSelected;
  const checkboxRef = useRef(null);

  useEffect(() => {
    if (checkboxRef.current) checkboxRef.current.indeterminate = someSelected;
  }, [someSelected]);

  const handleSelectAllClick = (e) => {
    e.stopPropagation();
    onSelectAll(node.id, !allSelected);
  };

  return (
    <div
      className={`cl-sec-node ${isSub ? "cl-sec-node--sub" : "cl-sec-node--root"}`}
      data-cl-depth={depth}
      style={{ "--card-color": cardColor }}
    >
      <div className={`cl-sec-head ${isSub ? "cl-sec-head--sub" : ""}`}>
        <button
          type="button"
          className="cl-sec-head__main"
          onClick={() => onSectionToggle(node.id)}
          aria-expanded={isOpen}
        >
          <div className="cl-sec-head__text">
            <h3 className="cl-sec-title">{node.title || "Section"}</h3>
            <div className="cl-sec-progress">
              <span className="cl-sec-count">
                {done} / {total}
              </span>
              <div className="checklist-progress-bar cl-sec-progress-bar">
                <div className="checklist-progress-fill" style={{ width: `${pct}%`, backgroundColor: cardColor }} />
              </div>
            </div>
          </div>
          <span className="checklist-accordion-icon">{isOpen ? "▼" : "▶"}</span>
        </button>
        <div className="cl-sec-head__actions">
          <button
            type="button"
            className="checklist-select-all-btn"
            onClick={handleSelectAllClick}
            title={allSelected ? "Deselect all" : "Select all"}
            style={{ "--card-color": cardColor }}
          >
            <input
              type="checkbox"
              ref={checkboxRef}
              checked={allSelected}
              onChange={() => {}}
              className="checklist-select-all-checkbox"
            />
            <span className="checklist-select-all-label">{allSelected ? "Deselect all" : "Select all"}</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="cl-sec-body">
          {node.items.length > 0 && (
            <ChecklistItemsTable
              items={node.items}
              itemsData={itemsData}
              onItemChange={onItemChange}
              cardColor={cardColor}
              isViewOnly={isViewOnly}
              isDAModule={isDAModule}
            />
          )}
          {(node.subSections || []).map((sub) => (
            <ChecklistSectionNode
              key={sub.id}
              node={sub}
              itemsData={itemsData}
              onItemChange={onItemChange}
              openSections={openSections}
              onSectionToggle={onSectionToggle}
              onSelectAll={onSelectAll}
              cardColor={cardColor}
              isViewOnly={isViewOnly}
              isDAModule={isDAModule}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function nodeItemsEveryUploaded(node, itemsData) {
  const ok = (id) => {
    const d = itemsData[id] || {};
    return d.checked === true;
  };
  const walk = (n) => {
    for (const it of n.items || []) {
      if (!ok(it.id)) return false;
    }
    for (const s of n.subSections || []) {
      if (!walk(s)) return false;
    }
    return true;
  };
  if ((node.items || []).length === 0 && !(node.subSections || []).length) return false;
  return walk(node);
}

function nodeItemsSomeUploaded(node, itemsData) {
  const any = (id) => {
    const d = itemsData[id] || {};
    return d.checked === true;
  };
  const walk = (n) => {
    for (const it of n.items || []) {
      if (any(it.id)) return true;
    }
    for (const s of n.subSections || []) {
      if (walk(s)) return true;
    }
    return false;
  };
  return walk(node);
}

ChecklistSectionNode.propTypes = {
  node: PropTypes.object.isRequired,
  itemsData: PropTypes.object.isRequired,
  onItemChange: PropTypes.func.isRequired,
  openSections: PropTypes.object.isRequired,
  onSectionToggle: PropTypes.func.isRequired,
  onSelectAll: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
  isViewOnly: PropTypes.bool,
  isDAModule: PropTypes.bool,
  depth: PropTypes.number,
};

export default ChecklistSectionNode;
