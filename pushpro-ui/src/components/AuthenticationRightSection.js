import React, { useState, useEffect } from "react";
import { Col } from "react-bootstrap";
import { useRouter } from "next/router";
import { assetPrefix } from "../../next.config";

const AuthenticationRightSection = () => {
  const router = useRouter();
  // const uuid = router.query.contractorId;
  const [contractorTagline, setContractorTagline] = useState(null);
  const [contractorDescription, setContractorDescription] = useState(null);
  const [rightSectionImage, setRightSectionImage] = useState(null);
  const s3BasePath = process.env.NEXT_PUBLIC_BASE_S3_PATH || "";
  useEffect(() => {
    const rightSectionImg = localStorage.getItem("rightSectionImage");
    const contractorTagline = localStorage.getItem("contractor_tagline");
    const contractorDescription = localStorage.getItem(
      "contractor_description"
    );
    if (rightSectionImg) {
      setRightSectionImage(rightSectionImg);
    }
    if (contractorTagline) {
      setContractorTagline(contractorTagline);
    }
    if (contractorDescription) {
      setContractorDescription(contractorDescription);
    }
  });
  return (
    <Col xxl={5} xl={5} lg={5} className=" px-0 mob-logo-center">
      <div className="authentication-cover">
        <div className="aunthentication-cover-content rounded">
          <div className="swiper keyboard-control">
            <div className=" text-center black-text p-5 d-flex align-items-center justify-content-center">
              <div>
                <div className="mb-5">
                  {rightSectionImage ? (
                    <div>
                      <img
                        className="login-img"
                        src={`${s3BasePath}${rightSectionImage}`}
                        alt="Login image"
                      />
                      <h6 className="fw-semibold mt-4">{contractorTagline}</h6>
                      <p className="fw-normal fs-14 op-7">
                        {contractorDescription}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-5">
                        <img
                          className="login-img"
                          src={`${assetPrefix}/assets/images/apps/login-img.png`}
                          alt="Login image"
                        />
                      </div>
                      <h6 className="fw-semibold mt-2">
                        Project Tag Line Goes Here!
                      </h6>
                      <p className="fw-normal fs-14 op-7 d-xl-block d-none">
                        {" "}
                        Lorem ipsum dolor sit amet, consectetur adipisicing
                        elit. Ipsa eligendi expedita aliquam quaerat nulla
                        voluptas facilis. Porro rem voluptates possimus, ad,
                        autem quae culpa architecto, quam labore blanditiis at
                        ratione.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Col>
  );
};

export default AuthenticationRightSection;
