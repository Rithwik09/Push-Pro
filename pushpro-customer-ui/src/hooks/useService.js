import axios from "axios";
import { useRouter } from "next/router";
import Swal from "sweetalert2";

let requestInProgress = {};

const useService = () => {
  const baseUrl = process.env.NEXT_PUBLIC_CUSTOMER_API_URL;
  const router = useRouter();

  const service = axios.create({
    baseURL: baseUrl,
    headers: {
      "Content-Type": "application/json"
    }
  });

  service.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const handleErrorDialog = (error) => {
    if (error.response && error.response.data) {
      if (error.response.status === 401 || error.response.status === 409) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response.data.message || "Authentication error"
        });
      } else if (error.response.data.errors) {
        const errorMsgs = error.response.data.errors;
        console.error("API Error:", errorMsgs);
        errorMsgs.forEach((errorMsg) => {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: errorMsg
          });
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response.data.message || "Unknown Error Occurred"
        });
      }
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error || "Something Went Wrong"
      });
    }
  };

  const handleSuccessDialog = (response) => {
    if (response.success === true) {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: response.message || "Operation completed successfully"
      });
    }
  };

  const handleAutoCloseSuccess = (response) => {
    if (response.success === true) {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: response.message || "Operation completed successfully",
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  // const handleConfirm = (response) =>{
  //   const contractorId = localStorage.getItem("currentContractor");
  //   Swal.fire({
  //     icon: "question",
  //     title: " ",
  //     text: response,
  //     showDenyButton: true,
  //     showCancelButton: false,
  //     confirmButtonText: 'Yes',
  //     denyButtonText: `No`,
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       Swal.fire({
  //         icon: "success",
  //         title: "Success",
  //         text: "Successfully Registered Please Login to procceed with new contractor",
  //         showConfirmButton: true,
  //       });
  //     router.push(`/login/${contractorId}`);
  //     }
  //   });
  // }

  const handleAccountStatusError = (response) => {
    if (response.data && response.data.account_status === "Inactive") {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Your account is currently inactive. Please contact support for assistance."
      });
      throw new Error(
        "Your account is currently inactive. Please contact support for assistance."
      );
    }
    if (response.data && response.data.is_verified === false) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Your account has not been verified. Please verify it first."
      });
      throw new Error(
        "Your account has not been verified. Please verify it first."
      );
    }
  };

  const handleInvalidTokenError = (error) => {
    const contractorId = localStorage.getItem("currentContractor");
    if (error.response.status === 409) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Your session has expired. Please login again."
      });
      const keepItems = [
        "currentContractor",
        "ynexMenu",
        "primaryRGB",
        "dynamiccolor",
        "rightSectionImage",
        "contractor_tagline",
        "contractor_description"
      ];
      for (let key in localStorage) {
        if (!keepItems.includes(key)) {
          localStorage.removeItem(key);
        }
      }
      router.push(`/login/${contractorId}`);
    }
  };

  const get = async (url, config = {}) => {
    if (requestInProgress[url]) return;
    requestInProgress[url] = true;
    try {
      const response = await service.get(url, config);
      handleAccountStatusError(response.data);
      requestInProgress[url] = false;
      return response.data;
    } catch (error) {
      handleInvalidTokenError(error);
      console.error("Get API Error:");
      requestInProgress[url] = false;
      if (error.response) {
        console.error("Response error:");
      } else if (error.request) {
        console.error("Request error:");
      } else {
        console.error("Error:");
      }
      throw error;
    }
  };

  const post = async (url, data, config = {}) => {
    if (requestInProgress[url]) return;
    requestInProgress[url] = true;
    try {
      const response = await service.post(url, data, config);
      handleAccountStatusError(response.data);
      requestInProgress[url] = false;
      return response.data;
    } catch (error) {
      handleInvalidTokenError(error);
      // console.error("Post API Error : ", error);
      console.error("Post API Error");
      requestInProgress[url] = false;
      throw error;
    }
  };

  const patch = async (url, data, config = {}) => {
    if (requestInProgress[url]) return;
    requestInProgress[url] = true;
    try {
      const response = await service.patch(url, data, config);
      handleAccountStatusError(response.data);
      requestInProgress[url] = false;
      return response.data;
    } catch (error) {
      // console.error("Patch API Error : ", error);
      console.error("Patch API Error ");
      requestInProgress[url] = false;
      handleInvalidTokenError(error);
      throw error;
    }
  };

  const put = async (url, data, config = {}) => {
    if (requestInProgress[url]) return;
    requestInProgress[url] = true;
    try {
      const response = await service.put(url, data, config);
      handleAccountStatusError(response.data);
      requestInProgress[url] = false;
      return response.data;
    } catch (error) {
      // console.error("Put API Error : ", error);
      console.error("Put API Error ");
      requestInProgress[url] = false;
      handleInvalidTokenError(error);
      throw error;
    }
  };

  const del = async (url, config = {}) => {
    if (requestInProgress[url]) return;
    requestInProgress[url] = true;
    try {
      const response = await service.delete(url, config);
      handleAccountStatusError(response.data);
      requestInProgress[url] = false;
      return response.data;
    } catch (error) {
      requestInProgress[url] = false;
      // console.error("Delete API error:", error);
      console.error("Delete API error");
      handleInvalidTokenError(error);
      handleErrorDialog(error);
      throw error;
    }
  };

  return {
    get,
    post,
    patch,
    put,
    delete: del,
    handleSuccessDialog,
    // handleConfirm,
    handleErrorDialog,
    handleAutoCloseSuccess
  };
};

export default useService;
