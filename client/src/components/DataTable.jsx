import { DataGrid, GridActionsCellItem, GridRowModes } from "@mui/x-data-grid";
import axios from "axios";
import { Edit, ExternalLinkIcon, Save, Trash2 } from "lucide-react";
import React, { useEffect } from "react";
import { useState } from "react";
import { showErrorToast, showSuccessToast } from "./ToastNotification";
import { useFetchPaginatedProductsQuery } from "../redux/apiSlice";
import ConfirmModal from "./ConfirmModal";
import { useSelector } from "react-redux";

const DataTable = ({
  rows,
  columns,
  apiEndpoints,
  role,
  deleteRow,
  updateRow,
  pagination,
  // page,
  // pageSize,
  rowCount,
  // handlePageChange,
  // handlePageSizeChange
  paginationModel,
  setPaginationModel,
  loading,
}) => {
  const [rowModesModel, setRowModesModel] = useState({});
  const [dataRows, setDataRows] = useState(rows);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  const selectedStoreId = useSelector((state) => state.store.selectedStoreId);

  useEffect(() => {
    setDataRows(rows);
    // setRowCount(rows?.length || 0);
  }, [rows]);

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });

    const updatedRow = dataRows.find((row) => row.id === id);
  };

  const handleDeleteClick = (id) => async () => {
    try {
      const res = await deleteRow({id, selectedStoreId}).unwrap();

      if (res.success == true) {
        showSuccessToast("Row deleted successfully!");
        setDataRows(dataRows.filter((row) => row.id !== id));
      } else {
        showErrorToast("Row deleted failed");
      }
    } catch (error) {
      console.log(error);
      
      if (error.data) {
        showErrorToast(
          error.data.message || "An unexpected server error occurred"
        );
      } else {
        showErrorToast("An unexpected error occurred");
      }
    }
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = async (newRow) => {
    const updatedRow = { ...newRow, isNew: false };
    setDataRows(
      dataRows.map((row) => (row.id === newRow.id ? updatedRow : row))
    );

    await handleUpdateRowReq(updatedRow);
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleUpdateRowReq = async (updatedRow) => {
    const updatedData = {};
    columns.forEach((col) => {
      if (col.editable) updatedData[col.field] = updatedRow[col.field];
    });

    const { id } = updatedRow;

    try {
      const res = await updateRow({ id, updatedData, selectedStoreId }).unwrap();

      if (res.success) {
        showSuccessToast("Row updated successfully!");
      } else {
        showErrorToast("Failed to update row");
      }
    } catch (error) {
      console.log(error);
      if (error.data) {
        showErrorToast(
          error.data.message || "An unexpected server error occurred"
        );
      } else {
        showErrorToast("An unexpected error occurred");
      }
    }
  };

  const actionColumn = {
    field: "actions",
    type: "actions",
    headerName: "Actions",
    width: 200,
    getActions: ({ id }) => {
      const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

      if (isInEditMode) {
        return [
          <GridActionsCellItem
            icon={<Save />}
            label="Save"
            onClick={handleSaveClick(id)}
          />,
          <GridActionsCellItem
            icon={<ExternalLinkIcon />}
            label="Cancel"
            onClick={handleCancelClick(id)}
          />,
        ];
      }
      return [
        <GridActionsCellItem
          icon={<Edit />}
          label="Edit"
          onClick={handleEditClick(id)}
        />,
        <GridActionsCellItem
          icon={<Trash2 />}
          label="Delete"
          // onClick={handleDeleteClick(id)}
          onClick={() => {
            setSelectedDeleteId(id);
            setIsConfirmModalOpen(true);
          }}
        />,
      ];
    },
  };

  return (
    <>
      <DataGrid
        rows={rows}
        columns={[...columns, ...(role == "ADMIN" ? [actionColumn] : [])]}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        onProcessRowUpdateError={(error) =>
          showErrorToast("Failed to update row")
        }
        pagination={pagination}
        paginationMode={pagination ? "server" : "client"}
        rowCount={pagination ? rowCount : undefined}
        // page={page}
        // pageSize={pageSize}
        // onPageChange={(newPage) => handlePageChange(newPage)}
        // onPageSizeChange={(newPageSize) => handlePageSizeChange(newPageSize)}
        // rowsPerPageOptions={[3,5,10]}
        paginationModel={paginationModel}
        onPaginationModelChange={(newModel) => setPaginationModel(newModel)}
        loading={loading}
        sx={{
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#0f172a",
          },
        }}
      />

      {/* Delete Confirm Modal */}

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setSelectedDeleteId(null);
          setIsConfirmModalOpen(false);
        }}
        onConfirm={() => {
          if (selectedDeleteId) {
            handleDeleteClick(selectedDeleteId)();
            setIsConfirmModalOpen(false);
            setSelectedDeleteId(null);
          }
        }}
      />
    </>
  );
};

export default DataTable;
