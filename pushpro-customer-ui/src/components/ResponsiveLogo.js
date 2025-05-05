import { assetPrefix } from "../../next.config";
import { useEffect, useState } from "react";
const ResponsiveLogo = () => {
  const [logoImage, setLogoImage] = useState(null);
  const s3BasePath = process.env.NEXT_PUBLIC_BASE_S3_PATH || "";
  useEffect(() => {
    const mainLogo = localStorage.getItem("mainLogo");
    if (mainLogo) {
      setLogoImage(mainLogo);
    }
  });
  return (
    <div className="mb-4 d-xl-none logo-center">
      <a href="/register/#">
        {logoImage ? (
          <div>
            <img
              src={`${s3BasePath}${logoImage}`}
              alt=""
              className="authentication-brand mobile-logo m-0 test12"
            />
          </div>
        ) : (
          <div>
            <img
              src={`${assetPrefix}/assets/images/brand-logos/light-logo.png`}
              alt=""
              className="authentication-brand mobile-logo m-0 test12"
            />
          </div>
        )}
      </a>
    </div>
  );
};

export default ResponsiveLogo;
