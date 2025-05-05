import axios from "axios";
import { useRouter } from "next/router";
import Swal from "sweetalert2";

const useService = () => {
  const baseUrl = process.env.NEXT_PUBLIC_CONTRACTOR_API_URL;
  const router = useRouter();

  const requestInProgress = {};
  const service = axios.create({
    baseURL: baseUrl,
    headers: {
      "Content-Type": "application/json"
    }
  });

  service.interceptors.request.use(
    (config) => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  const handleNullContractorDetailsError = async (event) => {
    try {
      const userData =
        typeof window !== "undefined"
          ? localStorage.getItem("user_data")
          : null;
      if (userData) {
        const user = JSON.parse(userData);
        if (user && !user.company_details) {
          await router.push({
            pathname: "/myprofile",
            query: { activeTab: "company-information" }
          });
        }
      }
    } catch (error) {
      console.error("Error checking contractor company details:", error);
    }
  };

  // Error handling for account status
  const handleAccountStatusError = (response) => {
    if (response?.account_status === "Inactive") {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Your account is currently inactive. Please contact support for assistance."
      });
      throw new Error("Account is inactive");
    }

    if (response?.is_verified === false) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Your account has not been verified. Please verify it first."
      });
      throw new Error("Account is not verified");
    }
  };

  // Handle invalid token errors
  const handleInvalidTokenError = (error) => {
    if (error?.response?.status === 401 || error?.response?.status === 409) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Your session has expired. Please login again."
      });

      // Clear localStorage and redirect to login
      if (typeof window !== "undefined") {
        localStorage.clear();
        router.push("/login");
      }
    }
  };

  // Common request handling logic
  const commonRequestHandler = async (
    method,
    url,
    data = null,
    config = {}
  ) => {
    if (requestInProgress[url]) return undefined;
    requestInProgress[url] = true;
    // console.log("Request Details:", { method, url, data, config });
    try {
      if (method === "get" || method === "post") {
        await handleNullContractorDetailsError();
      }
      let response;
      switch (method) {
        case "get":
          response = await service.get(url, config);
          break;
        case "post":
          response = await service.post(url, data, config);
          break;
        case "put":
          response = await service.put(url, data, config);
          break;
        case "patch":
          response = await service.patch(url, data, config);
          break;
        case "delete":
          response = await service.delete(url, config);
          break;
        default:
          throw new Error("Invalid HTTP method");
      }
      handleAccountStatusError(response.data);
      requestInProgress[url] = false;
      return response.data;
    } catch (error) {
      requestInProgress[url] = false;
      handleInvalidTokenError(error);
      console.error(`${method.toUpperCase()} API Error:`, error);
      throw error;
    }
  };

  // Get method
  const get = async (url, config = {}) => {
    return await commonRequestHandler("get", url, null, config);
  };

  // Post method
  const post = async (url, data, config = {}) => {
    return await commonRequestHandler("post", url, data, config);
  };

  // Put method
  const put = async (url, data, config = {}) => {
    return await commonRequestHandler("put", url, data, config);
  };

  // Patch method
  const patch = async (url, data, config = {}) => {
    return await commonRequestHandler("patch", url, data, config);
  };

  // Delete method
  const del = async (url, config = {}) => {
    return await commonRequestHandler("delete", url, null, config);
  };

  // Success dialog handler
  const handleSuccessDialog = (response) => {
    if (response?.success === true) {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: response.message || "Operation completed successfully"
      });
    }
  };

  // Auto-close success dialog handler
  const handleAutoCloseSuccess = (response) => {
    if (response?.success === true) {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: response.message || "Operation completed successfully",
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  // Error dialog handler
  const handleErrorDialog = (error) => {
    if (error?.response) {
      if (error.response.status === 401 || error.response.status === 409) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response.data?.message || "Unauthorized"
        });
      } else if (error.response.data?.errors) {
        error.response.data.errors.forEach((errorMsg) => {
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
          text: error.response.data?.message || "Unknown Error Occurred"
        });
      }
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.message || "Something Went Wrong"
      });
    }
  };

  return {
    get,
    post,
    put,
    patch,
    delete: del,
    handleSuccessDialog,
    handleErrorDialog,
    handleAutoCloseSuccess,
    handleNullContractorDetailsError
  };
};

export default useService;
