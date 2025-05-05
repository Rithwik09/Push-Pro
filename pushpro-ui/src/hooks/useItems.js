import { useEffect, useState } from "react";
import useService from "./useService";
import Swal from "sweetalert2";

const useItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const service = useService();
  const { handleErrorDialog } = service;
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalitem, setTotalitem] = useState("");
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const fetchData = async () => {
    try {
      setLoading(true);
      const condition = {};
      if (searchTerm) {
        condition.title = searchTerm;
      }
      const response = await service.post("/myprofile/contractor-items", {
        pageNo: currentPage,
        limit: pageSize,
        search: "",
        condition: condition
      });
      if (response.data && response.data.items) {
        const flattenedItems = Object.values(response.data.items).flat();
        setItems(flattenedItems);
        setTotalPages(response.data.totalPages);
        setTotalitem(response.data.totalItems);
      } else {
        setItems([]);
      }
    } catch (error) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, searchTerm]);

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this record!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await service.delete(`/myprofile/item/del/${id}`);
          if (response?.success) {
            setItems((prevItems) =>
              prevItems.filter((item) => item.itemId !== id)
            );
            Swal.fire({
              position: "center",
              icon: "success",
              title: "Item Deleted Successfully",
              showConfirmButton: false,
              timer: 1500
            });
          }
        } catch (error) {
          error = {
            message: "Cannot Delete Item. Item Used in Estimation."
          };
          handleErrorDialog(error);
        }
      }
    });
  };

  const reset = () => {
    setSearchTerm("");
    setCurrentPage(1);
    fetchData();
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      fetchData();
    }
  };

  return {
    items,
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalitem,
    setTotalPages,
    fetchData,
    reset,
    handleDelete,
    paginate,
    handleEnter
  };
};

export default useItems;
