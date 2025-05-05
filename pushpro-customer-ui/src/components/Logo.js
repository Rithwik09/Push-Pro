import React, { useState, useEffect } from "react";
import { assetPrefix } from "../../next.config";

const Logo = () => {
  const [logoImage, setLogoImage] = useState(null);
  const s3BasePath = process.env.NEXT_PUBLIC_BASE_S3_PATH || "";
  useEffect(() => {
    const logoImg = localStorage.getItem("mainLogo");
    if (logoImg) {
      setLogoImage(s3BasePath + logoImg);
    }
  });
  return (
    <div className="mb-4 d-none d-xl-block">
      {logoImage ? (
        <>
          <div className="">
            <img
              src={`${logoImage}`}
              alt=""
              className="authentication-brand desktop-logo m-0 b-logo"
            />
          </div>
          <img
            src={`${logoImage}`}
            alt=""
            className="authentication-brand desktop-dark b-logo"
          />
        </>
      ) : (
        <>
          <div className="">
            <img
              src={`${assetPrefix}/assets/images/brand-logos/light-logo.png`}
              alt=""
              className="authentication-brand desktop-logo m-0"
            />
          </div>
          <img
            src={`${assetPrefix}/assets/images/brand-logos/light-logo.png`}
            alt=""
            className="authentication-brand desktop-dark"
          />
        </>
      )}
    </div>
  );
};

export default Logo;
