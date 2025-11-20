import CustomModal from '../../../components/CustomModal';
import icon from '../../../assets/images/icon-chevToggle.svg';
import '../../../design/scss/add-permissions.scss';

export function PermissionModal({ showModal, closeModal }) {
  const renderHeader = () => (
    <>
      <h1 className="modal-title fs-5" id="addpermissonModalLabel">
        Add Designation and Permission
      </h1>
    </>
  );

  const renderBody = () => (
    <div className="modal-body">
      <div className="addPermissions">
        <form action="#">
          <div className="permInputs">
            <div className="form-floating desig-inp">
              <input
                type="text"
                className="form-control"
                id="floatingName"
                placeholder="Name"
              />
              <label htmlFor="floatingInput">Designation name *</label>
            </div>
            <div className="form-floating desc-input">
              <input
                type="text"
                className="form-control"
                id="floatingDesc"
                placeholder="Description"
              />
              <label htmlFor="floatingPassword">Description</label>
            </div>
          </div>

          <div className="permCheck-item">
            {/* <!-- level 1 --> */}
            <div className="permCheckWrp">
              <div className="title">Dashboard</div>

              <span className="toggleSwitch">
                <span className="togglerCheckbox">
                  <input type="checkbox" name="toggleD" id="toggleD" />
                  <label htmlFor="toggleD" className="checkLabel" />
                </span>
              </span>

              <button
                type="button"
                className="btn btn-toggle"
                data-bs-toggle="collapse"
                data-bs-target="#permission_1"
                aria-expanded="false"
                aria-controls="permission_1"
              >
                <img src={icon} alt="down" />
              </button>
            </div>

            <div className="permCheck-inner">
              <div className="collapse" id="permission_1">
                <div className="permInnerItems">
                  <div className="permCheck-item level_2">
                    {/* <!-- level 2 --> */}
                    <div className="permCheckWrp">
                      <div className="title">Dasbhoard Items</div>
                      <span className="toggleSwitch">
                        <span className="togglerCheckbox">
                          <input type="checkbox" name="toggleD" id="toggleD" />
                          <label htmlFor="toggleD" className="checkLabel" />
                        </span>
                      </span>

                      <button
                        className="btn btn-toggle"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#permission_Level1"
                        aria-expanded="true"
                        aria-controls="permission_Level1"
                      >
                        <img src={icon} alt="down" />
                      </button>
                    </div>
                    <div className="collapse" id="permission_Level1">
                      {/* <!-- level3  --> */}
                      <div className="permcheck-subitems row">
                        <div className="col-xl-4 col-md-6">
                          <div className="permCheckWrp">
                            <div className="title">Total Income</div>

                            <span className="toggleSwitch">
                              <span className="togglerCheckbox">
                                <input
                                  type="checkbox"
                                  name="toggleD"
                                  id="toggleD"
                                />
                                <label
                                  htmlFor="toggleD"
                                  className="checkLabel"
                                />
                              </span>
                            </span>

                            <button className="btn btn-toggle" type="button">
                              <img src={icon} alt="down" />
                            </button>
                          </div>
                        </div>

                        <div className="col-xl-4 col-md-6">
                          <div className="permCheckWrp">
                            <div className="title">Total Income</div>

                            <span className="toggleSwitch">
                              <span className="togglerCheckbox">
                                <input
                                  type="checkbox"
                                  name="toggleD"
                                  id="toggleD"
                                />
                                <label
                                  htmlFor="toggleD"
                                  className="checkLabel"
                                />
                              </span>
                            </span>

                            <button className="btn btn-toggle" type="button">
                              <img src={icon} alt="down" />
                            </button>
                          </div>
                        </div>

                        <div className="col-xl-4 col-md-6">
                          <div className="permCheckWrp">
                            <div className="title">Total Income</div>

                            <span className="toggleSwitch">
                              <span className="togglerCheckbox">
                                <input
                                  type="checkbox"
                                  name="toggleD"
                                  id="toggleD"
                                />
                                <label
                                  htmlFor="toggleD"
                                  className="checkLabel"
                                />
                              </span>
                            </span>

                            <button className="btn btn-toggle" type="button">
                              <img src={icon} alt="down" />
                            </button>
                          </div>
                        </div>

                        <div className="col-xl-4 col-md-6">
                          <div className="permCheckWrp">
                            <div className="title">Total Income</div>

                            <span className="toggleSwitch">
                              <span className="togglerCheckbox">
                                <input
                                  type="checkbox"
                                  name="toggleD"
                                  id="toggleD"
                                />
                                <label
                                  htmlFor="toggleD"
                                  className="checkLabel"
                                />
                              </span>
                            </span>

                            <button className="btn btn-toggle" type="button">
                              <img src={icon} alt="down" />
                            </button>
                          </div>
                        </div>

                        <div className="col-xl-4 col-md-6">
                          <div className="permCheckWrp">
                            <div className="title">Total Income</div>

                            <span className="toggleSwitch">
                              <span className="togglerCheckbox">
                                <input
                                  type="checkbox"
                                  name="toggleD"
                                  id="toggleD"
                                />
                                <label
                                  htmlFor="toggleD"
                                  className="checkLabel"
                                />
                              </span>
                            </span>

                            <button className="btn btn-toggle" type="button">
                              <img src={icon} alt="down" />
                            </button>
                          </div>
                        </div>

                        <div className="col-xl-4 col-md-6">
                          <div className="permCheckWrp">
                            <div className="title">Total Income</div>

                            <span className="toggleSwitch">
                              <span className="togglerCheckbox">
                                <input
                                  type="checkbox"
                                  name="toggleD"
                                  id="toggleD"
                                />
                                <label
                                  htmlFor="toggleD"
                                  className="checkLabel"
                                />
                              </span>
                            </span>

                            <button className="btn btn-toggle" type="button">
                              <img src={icon} alt="down" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="permCheck-item">
            <div className="permCheckWrp">
              <div className="title">Workers</div>

              <span className="toggleSwitch">
                <span className="togglerCheckbox">
                  <input type="checkbox" name="toggleD" id="toggleD" />
                  <label htmlFor="toggleD" className="checkLabel" />
                </span>
              </span>

              <button className="btn btn-toggle" type="button">
                <img src={icon} alt="down" />
              </button>
            </div>
          </div>

          <div className="permCheck-item">
            <div className="permCheckWrp">
              <div className="title">Prospect</div>

              <span className="toggleSwitch">
                <span className="togglerCheckbox">
                  <input type="checkbox" name="toggleD" id="toggleD" />
                  <label htmlFor="toggleD" className="checkLabel" />
                </span>
              </span>

              <button className="btn btn-toggle" type="button">
                <img src={icon} alt="down" />
              </button>
            </div>
          </div>

          <div className="permCheck-item">
            <div className="permCheckWrp">
              <div className="title">Dashboard</div>

              <span className="toggleSwitch">
                <span className="togglerCheckbox">
                  <input type="checkbox" name="toggleD" id="toggleD" />
                  <label htmlFor="toggleD" className="checkLabel" />
                </span>
              </span>

              <button className="btn btn-toggle" type="button">
                <img src={icon} alt="down" />
              </button>
            </div>
          </div>

          <div className="permCheck-item">
            <div className="permCheckWrp">
              <div className="title">User Managemet</div>

              <span className="toggleSwitch">
                <span className="togglerCheckbox">
                  <input type="checkbox" name="toggleD" id="toggleD" />
                  <label htmlFor="toggleD" className="checkLabel" />
                </span>
              </span>

              <button className="btn btn-toggle" type="button">
                <img src={icon} alt="down" />
              </button>
            </div>
          </div>

          <div className="permCheck-item">
            <div className="permCheckWrp">
              <div className="title">Settings</div>

              <span className="toggleSwitch">
                <span className="togglerCheckbox">
                  <input type="checkbox" name="toggleD" id="toggleD" />
                  <label htmlFor="toggleD" className="checkLabel" />
                </span>
              </span>

              <button className="btn btn-toggle" type="button">
                <img src={icon} alt="down" />
              </button>
            </div>
          </div>
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
        Save
      </button>
    </div>
  );
  return (
    <CustomModal
      className="modal fade addPermissionMod show"
      dialgName="custom-mod custom-mod-xl modal-dialog modal-dialog-centered modal-dialog-scrollable"
      show={!!showModal}
      closeModal={() => closeModal(null)}
      body={renderBody()}
      footer={renderFooter()}
      header={renderHeader()}
    />
  );
}
