import { useRouter } from "next/router";
import { React, Fragment, useEffect, useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import useService from "@/hooks/useService";

const AccountActivation = () => {
  const router = useRouter();
  const service = useService();
  const { handleErrorDialog, handleAutoCloseSuccess } = service;
  const token = router.query.token;
  const [currentContractor, setCurrentContractor] = useState(null);

  useEffect(() => {
    const currContractor = localStorage.getItem("currentContractor");
    if (currContractor) {
      setCurrentContractor(currContractor);
    }
  }, []);

  useEffect(() => {
    const handleAccountActivation = async () => {
      try {
        const response = await service.post(`/account-activation/${token}`);
        if (response?.success) {
          handleAutoCloseSuccess(response);
        } else {
          handleErrorDialog({
            message: "Invalid Account Activation Code. Please try again."
          });
        }
      } catch (error) {
        handleErrorDialog(error.response.data.errors);
      } finally {
        router.push(`/login/${currentContractor}`);
      }
    };
    if (token && currentContractor !== null) {
      handleAccountActivation();
    }
  }, [
    token,
    currentContractor,
    handleAutoCloseSuccess,
    handleErrorDialog,
    router,
    service
  ]);

  return (
    <Fragment>
      <HelmetProvider>
        <Helmet>
          <body className="bg-white"></body>
        </Helmet>
        <div className="main-parent">
          <div className="grey-sec"></div>
        </div>
      </HelmetProvider>
    </Fragment>
  );
};

AccountActivation.layout = "AuthenticationLayout";
export default AccountActivation;
