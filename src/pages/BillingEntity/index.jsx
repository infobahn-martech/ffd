import { useState, useEffect, useCallback, useRef } from "react";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { BillingEntityModal } from "./Modals/AddEditBillingEntity";
import useBillingEntityReducer from "../../store/BillingEntityReducer";
import useAlertReducer from "../../store/AlertReducer";
import edit from "../../assets/images/edit.svg";

const resolveLogoUrl = (logoValue) => {
  if (!logoValue) return "";
  const logo = String(logoValue).trim();
  if (!logo) return "";
  if (/^(https?:)?\/\//i.test(logo) || /^data:/i.test(logo) || /^blob:/i.test(logo)) {
    return logo;
  }
  const envBase = import.meta.env.VITE_API_ENDPOINT || "";
  if (!envBase) return logo;
  const normalizedBase = envBase.endsWith("/") ? envBase.slice(0, -1) : envBase;
  const rootBase = normalizedBase.endsWith("/api")
    ? normalizedBase.slice(0, -4)
    : normalizedBase;
  return `${rootBase}${logo.startsWith("/") ? "" : "/"}${logo}`;
};

const BillingEntity = () => {
  const fileInputRefs = useRef({});
  const [params, setParams] = useState({
    page: 1,
    total: 0,
    limit: 10,
    searchTerm: "",
    sortOrder: -1,
    sortBy: "createdAt",
  });

  const [showBillingEntityModal, setShowBillingEntityModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    getBillingEntities,
    billingEntities,
    totalCount,
    isLoading,
    updateBillingEntityLogo,
    isLogoUploading,
    logoUploadEntityId,
  } = useBillingEntityReducer((state) => state);

  const fetchBillingEntities = useCallback(() => {
    const apiParams = {
      page: params.page,
      limit: params.limit,
      ...(params.searchTerm && { searchTerm: params.searchTerm }),
      ...(params.sortBy && { sortBy: params.sortBy }),
      ...(params.sortOrder != null && { sortOrder: params.sortOrder }),
    };
    getBillingEntities({ params: apiParams });
  }, [getBillingEntities, params]);

  useEffect(() => {
    fetchBillingEntities();
  }, [fetchBillingEntities]);

  const openLogoFilePicker = (entityId) => {
    const inputRef = fileInputRefs.current[entityId];
    if (inputRef) {
      inputRef.click();
    }
  };

  const handleLogoUpload = async (file, row) => {
    if (!(file instanceof File)) return;
    if (!file.type?.startsWith("image/")) {
      const { error } = useAlertReducer.getState();
      error("Only image files are allowed");
      return;
    }
    const entityId = row?.entity_id;
    if (!entityId) {
      const { error } = useAlertReducer.getState();
      error("Billing entity ID is missing for logo upload");
      return;
    }
    const isUploaded = await updateBillingEntityLogo({ entityId, file });
    if (isUploaded) {
      fetchBillingEntities();
    }
  };

  const renderLogoCell = ({ row }) => {
    const logoUrl = resolveLogoUrl(
      row?.entity_logo ?? row?.logo_path ?? row?.logo ?? row?.entityLogo
    );
    const entityId = row?.entity_id;
    const isUploadingThisRow = isLogoUploading && String(logoUploadEntityId) === String(entityId);

    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={`${row?.billing_entity || "Billing Entity"} logo`}
            style={{
              width: "40px",
              height: "40px",
              objectFit: "contain",
              border: "1px solid #d5d9e2",
              borderRadius: "8px",
              background: "#ffffff",
              padding: "2px",
            }}
          />
        ) : (
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "1px solid #d5d9e2",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              color: "#6b7280",
              background: "#f8fafc",
            }}
          >
            No Logo
          </div>
        )}
        <button
          type="button"
          onClick={() => openLogoFilePicker(entityId)}
          disabled={isUploadingThisRow}
          className="btn btn-link p-0"
          title="Upload logo"
          style={{
            border: "none",
            background: "transparent",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: isUploadingThisRow ? 0.6 : 1,
            pointerEvents: isUploadingThisRow ? "none" : "auto",
          }}
        >
          {isUploadingThisRow ? (
            <span style={{ fontSize: "11px", color: "#1d4ed8", whiteSpace: "nowrap" }}>
              Uploading...
            </span>
          ) : (
            <img src={edit} alt="Upload logo" style={{ width: "14px", height: "14px" }} />
          )}
        </button>
        <input
          type="file"
          accept="image/*"
          className="d-none"
          ref={(el) => {
            if (el) {
              fileInputRefs.current[entityId] = el;
            }
          }}
          onChange={(e) => {
            const selectedFile = e.target.files?.[0];
            handleLogoUpload(selectedFile, row);
            e.target.value = "";
          }}
        />
      </div>
    );
  };

  const cols = [
    {
      name: "Logo",
      selector: "entity_logo",
      width: "140",
      cell: renderLogoCell,
      thclass: "tb-head",
      contentClass: "table-content",
      notView: true,
    },
    {
      name: "Billing Entity",
      selector: "billing_entity",
      sort: true,
      width: "200",
      thclass: "tb-head",
      contentClass: "table-content",
    },
    {
      name: "Customer Code",
      selector: "customer_code",
      sort: true,
      width: "200",
      thclass: "tb-head",
      contentClass: "table-content",
    },
    // {
    //   name: 'VAT Number',
    //   selector: 'vatNo',
    //   sort: true,
    //   width: '200',
    //   thclass: 'tb-head',
    //   contentClass: 'table-content',
    // },
    {
      name: "Contact Person",
      selector: "contact_name",
      sort: true,
      width: "220",
      thclass: "tb-head",
      contentClass: "table-content",
    },
    {
      name: "Phone No.",
      selector: "phoneNumber",
      sort: true,
      width: "180",
      thclass: "tb-head",
      contentClass: "table-content",
    },
    // {
    //   name: 'Email',
    //   selector: 'email',
    //   sort: true,
    //   width: '250',
    //   thclass: 'tb-head',
    //   contentClass: 'table-content',
    // },
    // {
    //   name: 'Created At',
    //   selector: 'createdAt',
    //   sort: true,
    //   width: '200',
    //   cell: DateFormat,
    //   thclass: 'tb-head',
    //   contentClass: 'table-content',
    // },
    // {
    //   name: 'Updated At',
    //   selector: 'updatedAt',
    //   sort: true,
    //   width: '200',
    //   cell: DateFormat,
    //   thclass: 'tb-head',
    //   contentClass: 'table-content',
    // },
    // {
    //   name: 'Actions',
    //   selector: 'actions',
    //   width: '150',
    //   cell: RenderAction,
    //   thclass: 'tb-head',
    //   onEditClick: (row) => setShowBillingEntityModal(row),
    //   onDeleteClick: () => setShowDeleteModal(true),
    // },
  ];


  return (
    <>
      <div className="page-body">
        <div className="prospect employee">
          <div className="container-fluid">
            <CommonHeader
              tableTitle="Billing Accounts"
              isAddEnabled={false}
              setSearch={(e) =>
                setParams((prev) => ({ ...prev, searchTerm: e, page: 1, limit: 10 }))
              }
              exportTitle="Export"
              exportLoader={false}
            />
          </div>

          <CustomTable
            pagination={{ currentPage: params?.page, limit: params?.limit }}
            tableClasses="px-start"
            count={totalCount}
            columns={cols}
            isLoading={isLoading}
            data={billingEntities ?? []}
            onPageChange={(currentPage) =>
              setParams((prev) => ({ ...prev, page: currentPage }))
            }
            setLimit={(newlimit) => setParams((prev) => ({ ...prev, limit: newlimit }))}
            onSorting={(sortBy) => {
              setParams((prev) => ({
                ...prev,
                sortBy,
                sortOrder: prev?.sortOrder === -1 ? 1 : -1,
                page: 1,
              }));
            }}
          />
          {!!showBillingEntityModal && (
            <BillingEntityModal
              showModal={showBillingEntityModal}
              closeModal={() => setShowBillingEntityModal(false)}
              onSuccess={() => {
                fetchBillingEntities();
              }}
            />
          )}

          {!!showDeleteModal && (
            <DeleteConfirmationModal
              show={showDeleteModal}
              onCancel={() => setShowDeleteModal(false)}
              onConfirm={() => {}}
              deleteText="Are you sure you want to delete this billing entity?"
            // isLoading={isBeingUpdated}
            />
          )}


        </div>
      </div>
    </>
  );
};

export default BillingEntity;
