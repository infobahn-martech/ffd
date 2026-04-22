import PropTypes from "prop-types";
import ChecklistMetaCard from "./ChecklistMetaCard";
import ChecklistSectionNode from "./ChecklistSectionNode";

const ChecklistTypeBlock = ({
  typeTitle,
  sectionTree,
  meta,
  itemsData,
  onItemChange,
  openSections,
  onSectionToggle,
  onSelectAll,
  cardColor,
  isViewOnly,
  isDAModule,
  context,
}) => (
  <div className="cl-type-block" style={{ "--card-color": cardColor }}>
    {meta ? (
      <ChecklistMetaCard
        title={meta.checklistName || typeTitle}
        callType={meta.callType || context?.callType}
        port={meta.port || context?.port}
        vesselType={meta.vesselType || context?.vesselType}
        bargeType={meta.bargeType || context?.bargeType}
        createdAt={meta.createdAt}
        cardColor={cardColor}
      />
    ) : null}

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
  meta: PropTypes.object,
  itemsData: PropTypes.object.isRequired,
  onItemChange: PropTypes.func.isRequired,
  openSections: PropTypes.object.isRequired,
  onSectionToggle: PropTypes.func.isRequired,
  onSelectAll: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
  isViewOnly: PropTypes.bool,
  isDAModule: PropTypes.bool,
  context: PropTypes.object,
};

export default ChecklistTypeBlock;
