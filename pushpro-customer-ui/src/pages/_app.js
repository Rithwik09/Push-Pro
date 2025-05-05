import "../styles/globals.scss";
import FooterOnlyLayout from "@shared/layout-components/layout/footer-layout";
import Landingpagelayout from "../../shared/layout-components/layout/landingpage-layout";
import AuthenticationLayout from "../../shared/layout-components/layout/authentication-layout";
import ContentLayout from "../../shared/layout-components/layout/content-layout";
import { useRouter } from "next/router";
import PageLayout from "../../shared/layout-components/layout/page-layout";
import { I18nextProvider } from "react-i18next";
import translationEN from "../../public/locales/en.json";
import translationES from "../../public/locales/es.json";
import i18n from "../../i18n";

const layouts = {
  Contentlayout: ContentLayout,
  Landingpagelayout: Landingpagelayout,
  PageLayout: PageLayout,
  AuthenticationLayout: AuthenticationLayout,
  FooterOnlyLayout: FooterOnlyLayout,
};
function MyApp({ Component, pageProps }) {
  const Layout =
    layouts[Component.layout] || (({ children }) => <>{children}</>);
  return (
    <I18nextProvider i18n={i18n}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </I18nextProvider>
  );
}

export default MyApp;
