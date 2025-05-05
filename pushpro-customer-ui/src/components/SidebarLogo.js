import { assetPrefix } from "../../next.config";
const sidebarLogo = () => {
  return (
    <Link href="/dashboard" className="header-logo">
      <img
        src={`${assetPrefix}/assets/images/brand-logos/light-logo.png`}
        alt="logo"
        className="main-logo desktop-logo"
      />
      <img
        src={`${assetPrefix}/assets/images/brand-logos/toggle-dark.png`}
        alt="logo"
        className="main-logo toggle-logo"
      />
      <img
        src={`${assetPrefix}/assets/images/brand-logos/light-logo.png`}
        alt="logo"
        className="main-logo desktop-dark"
      />
      <img
        src={`${assetPrefix}/assets/images/brand-logos/toggle-light.png`}
        alt="logo"
        className="main-logo toggle-dark"
      />
      <img
        src={`${assetPrefix}/assets/images/brand-logos/light-logo.png`}
        alt="logo"
        className="main-logo desktop-white"
      />
      <img
        src={`${assetPrefix}/assets/images/brand-logos/toggle-light.png`}
        alt="logo"
        className="main-logo toggle-white"
      />
    </Link>
  );
};

export default sidebarLogo;
