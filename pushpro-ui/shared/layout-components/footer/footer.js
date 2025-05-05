
import Link from "next/link";
import React from 'react';
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <>
      <footer className="footer mt-auto py-3 bg-light text-center">
        <div className="container">
          <span className="text-muted"> {t('footerContent.copyright')} © <span id="year">{ new Date().getFullYear() }</span> <Link
            href={process.env.NEXT_PUBLIC_OMP_WEBSITE_LINK} className="text-dark mx-1 fw-semibold">{process.env.NEXT_PUBLIC_SITE_OWNER}.</Link>
            {t('footerContent.developedBy')} <Link href="">
              <span className="fw-semibold text-primary text-decoration-underline">{process.env.NEXT_PUBLIC_SITE_DEVELOPER_BY}</span>
            </Link>
            <span className="mx-1">
            {t('footerContent.allRightsReserved')}
            </span>
          </span>
        </div>
      </footer>
    </>
  )
}

export default Footer
