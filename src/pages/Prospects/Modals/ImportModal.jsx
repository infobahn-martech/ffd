import React, { useState } from 'react';
import CustomModal from '../../../components/CustomModal';
import * as XLSX from 'xlsx';
import { downloadSampleXLSX } from '../../../utils/utils';
// C:\Users\gopik_tb967pj\Desktop\Work\spericorn-homes-fe\src\assets\images\SamplePDF\prospect.xlsx

const ImportModal = ({ showModal, closeModal }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const excelContent = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];

        const arrayOfObjects = excelContent.map((row, rowIndex) => {
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = row[index];
            obj['rowIndex'] = rowIndex;
          });
          return obj;
        });

        // console.log('arrayOfObjects', arrayOfObjects);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const renderBody = () => (
    <div className="modal-body">
      <div className="lead-form">
        {/* <div className="mb-lg-3 mb-sm-0">
            <div className="permInputs row ">
              <div className="col">
                <div className="form-floating form-floating1 desig-inp">
                  <select className="form-select" id="floatingName">
                    <option value="1">Option 1</option>
                    <option value="2">Option 2</option>
                    <option value="3">Option 3</option>
                  </select>
                  <label htmlFor="floatingName">
                    Category<span>*</span>
                  </label>
                </div>
              </div>
            </div>
          </div> */}
        <div className="mb-lg-3 mb-sm-0">
          <div className="permInputs row ">
            <div className="col">
              <div className="input-group file-up position-relative desig-inp">
                {/* <input
                  type="file"
                  className="form-control"
                  id="selectedFile"
                  placeholder=""
                />
                <label
                  className="btn btn-outline-secondary position-absolute"
                  htmlFor="fileInput"
                >
                  Browse
                </label> */}
                <input
                  type="file"
                  className="form-control"
                  id="selectedFile"
                  onChange={handleFileChange}
                  accept=".xlsx, .xls"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="two-btn mt-4">
          <button
            className="btn-common close"
            onClick={() =>
              downloadSampleXLSX(
                [
                  'First Name',
                  'Last Name',
                  'Company',
                  'Email ID',
                  'Phone Number',
                ],
                'prospectSampleExcel.xlsx',
              )
            }
          >
            Download Sample
          </button>
          <button
            type="submit"
            className="save btn-common green-btn"
            onClick={() => handleImport()}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );

  const renderheader = () => (
    <div className="modal-header">
      <h5 className="modal-title" id="importLeadModalLabel">
        Import Prospect
      </h5>
    </div>
  );

  return (
    <CustomModal
      bodyClassname="modal fade employee-modal import-modal show"
      dialgName="modal-dialog modal-dialog-centered  employee-modal"
      show={showModal}
      closeModal={closeModal}
      body={renderBody()}
      header={renderheader()}

      //   body,
      //   footer,
      //   bodyClassname,
      //   createModal,
      //   disableCenter,
    />
  );
};

export default ImportModal;
