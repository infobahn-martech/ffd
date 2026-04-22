import PropTypes from "prop-types";
import ChecklistSectionNode from "./ChecklistSectionNode";

const ChecklistTypeBlock = ({
  typeTitle,
  sectionTree,
  itemsData,
  onItemChange,
  openSections,
  onSectionToggle,
  onSelectAll,
  cardColor,
  isViewOnly,
  isDAModule,
}) => (
  <div className="cl-type-block" style={{ "--card-color": cardColor }}>
    <div className="cl-type-block__tree">
      {sectionTree.map((node) => (
        <ChecklistSectionNode
          key={node.id}
          node={node}
          itemsData={itemsData}
          onItemChange={onItemChange}
          openSections={openSections}
          onSectionToggle={onSectionToggle}
          onSelectAll={onSelectAll}
          cardColor={cardColor}
          isViewOnly={isViewOnly}
          isDAModule={isDAModule}
          depth={0}
        />
      ))}
    </div>
  </div>
);

ChecklistTypeBlock.propTypes = {
  typeTitle: PropTypes.string.isRequired,
  sectionTree: PropTypes.array.isRequired,
  itemsData: PropTypes.object.isRequired,
  onItemChange: PropTypes.func.isRequired,
  openSections: PropTypes.object.isRequired,
  onSectionToggle: PropTypes.func.isRequired,
  onSelectAll: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
  isViewOnly: PropTypes.bool,
  isDAModule: PropTypes.bool,
};

export default ChecklistTypeBlock;
