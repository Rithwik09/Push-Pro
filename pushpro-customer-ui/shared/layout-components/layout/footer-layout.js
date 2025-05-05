import Footer from "../footer/footer";

const FooterOnlyLayout = ({ children }) => {
    return (
        <>
            {children}
            <Footer />
        </>
    );
};

export default FooterOnlyLayout;
