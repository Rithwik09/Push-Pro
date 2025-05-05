import { useRouter } from "next/router";
import { React, Fragment, useEffect } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import useService from "@/hooks/useService";

const AccountActivation = () => {
  const router = useRouter();
  const service = useService();
  const { handleErrorDialog, handleAutoCloseSuccess } = service;
  const token = router.query.token;

  const handleAccountActivation = async () => {
    try {
      const response = await service.post(`/account-activation/${token}`, {
        message: "Account Activation"
      });
      if (response?.success) {
        handleAutoCloseSuccess(response);
        router.push("/login");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.errors[0] || "Activation Failed";
      handleErrorDialog(errorMessage);
      router.push("/login");
    }
  };

  useEffect(() => {
    if (token) {
      handleAccountActivation();
    }
  }, []);
  return (
    <>
      <Fragment>
        <HelmetProvider>
          <Helmet>
            <body className="bg-white"></body>
          </Helmet>
          <div className="">
            <div className="main-parent">
              <div className="grey-sec"></div>
            </div>
          </div>
        </HelmetProvider>
      </Fragment>
    </>
  );
};
Error.layout = "AuthenticationLayout";
export default AccountActivation;
