import CustomModal from '../../../components/CustomModal';
import '../../../design/scss/prospect-modal.scss';
import '../../../design/scss/modal-designs.scss';
import '../../../design/scss/form-designs.scss';


export function PortModal({ showModal, closeModal }) {
  const renderHeader = () => (
    <>
      <h1 className="modal-title">
        Add Port
      </h1>
    </>
  );

  const renderBody = () => (
    <div className="modal-body">
      <div className="addPermissions">
        <form action="#">
        </form>
      </div>
    </div>
  );
  const renderFooter = () => (
    <div className="modal-footer">
      <button type="button" className="btn btn-outline" data-bs-dismiss="modal">
        Close
      </button>
      <button type="button" className="btn btn-primary">
        Save changes
      </button>
    </div>
  );
  return (
    <CustomModal
      // className="modal fade show"
      dialgName="modal-dialog modal-dialog-centered"
      // createModal
      show={!!showModal}
      closeModal={() => closeModal(null)}
      body={renderBody()}
      footer={renderFooter()}
      header={renderHeader()}
    />
  );
}
