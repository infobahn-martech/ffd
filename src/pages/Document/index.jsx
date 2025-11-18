import { useState } from "react";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";

const dummyRoles = [
  { _id: "1", name: "Admin", description: "Full system access" },
  { _id: "2", name: "Manager", description: "Manage users and workflows" },
  { _id: "3", name: "Viewer", description: "Read-only access" },
  { _id: "4", name: "Operator", description: "Handle daily operations" },
  { _id: "5", name: "Supervisor", description: "Review and approve tasks" },
];

const BillingEntity = () => {
  const [params, setParams] = useState({
    page: 1,
    searchTerm: "",
    limit: 10,
    sortBy: "name",
    sortOrder: 1,
  });


  // 👉 ONLY TWO COLUMNS (Name + Description)
  const cols = [
    {
      name: "Name",
      selector: "name",
      sort: true,
      width: "300",
      thclass: "tb-head",
      contentClass: "table-content",
    },
    {
      name: "Description",
      selector: "description",
      sort: true,
      width: "500",
      thclass: "tb-head",
      contentClass: "table-content",
    },
  ];

  return (
    <>
      <div className="page-body">
        <div className="prospect employee">
          <div className="container-fluid">
            <CommonHeader
              showFilter
              tableTitle="BillingEntity List"
              setSearch={(e) =>
                setParams({ ...params, searchTerm: e, page: 1 })
              }
              exportTitle="Export"
              exportLoader={false}
            />
          </div>

          <CustomTable
            pagination={{ currentPage: params.page, limit: params.limit }}
            tableClasses="px-start"
            count={dummyRoles.length}
            columns={cols}
            data={dummyRoles}
            onPageChange={(currentPage) =>
              setParams({ ...params, page: currentPage })
            }
            setLimit={(newLimit) =>
              setParams({ ...params, limit: newLimit })
            }
            onSorting={(sortBy) =>
              setParams({
                ...params,
                sortBy,
                sortOrder: params.sortOrder === 1 ? -1 : 1,
                page: 1,
              })
            }
          />
        </div>
      </div>
    </>
  );
};

export default BillingEntity;
