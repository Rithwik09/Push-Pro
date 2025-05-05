import { useEffect, useState } from "react";
import useService from "./useService";
import Swal from "sweetalert2";
import { useRouter } from "next/router";
import statusData from "../../shared/data/json/status.json";

const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalitems, setTotalitems] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [industry, setIndustry] = useState([]);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [industriesId, setIndustriesId] = useState([]);
  const [areas, setAreas] = useState([]);
  const [contId, setContId] = useState();
  const router = useRouter();
  const service = useService();
  const { delete: del, handleSuccessDialog, handleErrorDialog } = service;
  const { status } = router.query;

  useEffect(() => {
    const id = localStorage.getItem("currentContractor");
    setContId(id);
  }, []);

  useEffect(() => {
    if (contId) {
      fetchProjects();
      fetchServices();
      fetchAreas();
    }
    if (status) {
      setSelectedStatus(status);
    }
  }, [router.query.status, selectedStatus, currentPage, pageSize, contId]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const condition = {};
      if (searchTerm) {
        condition.title = searchTerm;
      }
      if (selectedStatus) {
        condition.status_id = selectedStatus;
      }
      const response = await service.post("/myprojects", {
        pageNo: currentPage,
        limit: pageSize,
        search: "",
        condition: condition,
        services: industriesId,
        contractorId: contId
      });
      if (response?.success) {
        setProjects(response?.data.projects);
        setTotalPages(response?.data.totalPage);
        setTotalitems(response?.data.totalitems);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAreas = async () => {
    try {
      const areaData = await service.get("/areas");
      if (areaData?.success) {
        setAreas(areaData.data);
      }
    } catch (error) {
      console.error("Error fetching areas:", error);
    }
  };

  const fetchServices = async () => {
    try {
      const industriesResponse = await service.get("/services");
      if (industriesResponse?.success) {
        const formattedIndustries = industriesResponse.data.map((industry) => ({
          label: industry.name,
          value: industry.name,
          id: industry.id
        }));
        setIndustry(formattedIndustries);
        setSelectedIndustries([]);
      }
    } catch (industriesError) {
      console.error("Error fetching industries:", industriesError);
    }
  };

  const statusOptions = statusData.map((status) => ({
    value: status.value,
    label: status.label,
    id: status.id
  }));

  const getStatusLabelById = (id) => {
    const status = statusData.find((status) => status.id === id);
    return status ? status.label : id;
  };

  const getAreaNameById = (id) => {
    const area = areas.find((area) => area.id === id);
    return area ? area.name : id;
  };

  const handleView = (id) => {
    router.push(`/project-detail/${id}`);
  };

  const handleCommunication = (id) => {
    router.push(`/project-communication/${id}`);
  };

  const handleSchedule = (id) => {
    router.push(`/project-schedule/${id}`);
  };

  const createProject = () => {
    router.push("../myprojects/create/");
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSearch = () => {
    fetchProjects();
    fetchAreas();
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      fetchProjects();
      fetchServices();
      fetchAreas();
    }
  };

  const reset = () => {
    setCurrentPage(1);
    setSearchTerm(null);
    setSelectedStatus(null);
    fetchProjects();
  };

  const handleStatusChange = (selectedOption) => {
    setSelectedStatus(selectedOption.id);
  };

  const handleIndustryChange = (selectedIndustries) => {
    const selectedIndustriesArray = selectedIndustries.map(
      (selectedIndustry) => {
        return selectedIndustry.id;
      }
    );
    setSelectedIndustries(selectedIndustries);
    setIndustriesId(selectedIndustriesArray);
  };

  const handleEdit = (projectId) => {
    router.push(`myprojects/edit/${projectId}/address`);
  };

  const handleDelete = async (id) => {
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
          const response = await del(`/myprojects/del/${id}`);
          if (response?.success || response?.status === 200) {
            handleSuccessDialog(response);
            const updatedProjectData = projects.filter((idx) => idx.id !== id);
            setProjects(updatedProjectData);
            fetchProjects();
          } else {
            handleErrorDialog(response?.errors || response?.message);
          }
        } catch (error) {
          console.error("Error during delete operation:", error);
          handleErrorDialog(error);
        }
      }
    });
  };

  return {
    projects,
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalitems,
    setTotalitems,
    setTotalPages,
    fetchProjects,
    reset,
    handleDelete,
    paginate,
    handleEnter,
    selectedStatus,
    setSelectedStatus,
    industry,
    setIndustry,
    selectedIndustries,
    setSelectedIndustries,
    industriesId,
    setIndustriesId,
    areas,
    setAreas,
    contId,
    setContId,
    statusOptions,
    getStatusLabelById,
    getAreaNameById,
    handleView,
    handleCommunication,
    handleSchedule,
    createProject,
    handleStatusChange,
    handleIndustryChange,
    handleEdit
  };
};

export default useProjects;
