import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { Button, Form, Row, Col, Spinner } from "react-bootstrap";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import useService from "@/hooks/useService";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <Spinner variant="primary" animation="border" size="md" />
});

const ContractText = ({ getUrl, patchUrl }) => {
  const { t } = useTranslation();
  const service = useService();
  const { handleSuccessDialog } = service;
  const [htmlContent, setHtmlContent] = useState("");
  const [error, setError] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const Router = useRouter();
  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchContractText = async () => {
    try {
      if (isClient) {
        const response = await service.get(getUrl);
        if (response?.success) {
          // Add more robust validation for initial content
          const initialContent = response?.data || "";
          const sanitizedInitialContent = initialContent
            .replace(/&nbsp;/g, " ")
            .replace(/<\/?[^>]+(>|$)/g, "")
            .trim();
          if (
            !initialContent ||
            sanitizedInitialContent === "" ||
            /^\s*<p>\s*<\/p>$/.test(initialContent)
          ) {
            // If content is invalid, set an empty string instead of showing an error
            setHtmlContent("");
            setError(t("companyInformationForm.contractTextForEstimates"));
          } else {
            // Set content if it passes validation
            setHtmlContent(initialContent);
            setError(null);
          }
        }
      }
    } catch (error) {
      console.error("Error Fetching Data :", error);
      setError("Failed to fetch contract text");
    }
  };

  useEffect(() => {
    fetchContractText();
  }, [getUrl, isClient]);
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: "1" }, { header: "2" }, { font: [] }],
        [{ size: [] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [
          { list: "ordered" },
          { list: "bullet" },
          { indent: "-1" },
          { indent: "+1" }
        ],
        ["link"],
        ["clean"]
      ]
    }),
    []
  );
  const formats = useMemo(
    () => [
      "header",
      "font",
      "size",
      "bold",
      "italic",
      "underline",
      "strike",
      "blockquote",
      "list",
      "bullet",
      "indent",
      "link"
    ],
    []
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Comprehensive validation for submission
      const sanitizedContent = htmlContent
        .replace(/&nbsp;/g, " ")
        .replace(/<\/?[^>]+(>|$)/g, "")
        .trim();
      const isContentInvalid =
        !htmlContent ||
        sanitizedContent === "" ||
        /^\s*<p>\s*<\/p>$/.test(htmlContent) ||
        sanitizedContent.length < 10;
      if (isContentInvalid) {
        setError(t("companyInformationForm.contractTextForEstimates"));
        return;
      }
      // Proceed with update if content is valid
      const response = await service.patch(patchUrl, {
        contract_text: htmlContent
      });
      if (response?.success) {
        handleSuccessDialog(response);
        setError(null);
        // Optional: Redirect or perform additional action
        Router.push("/dashboard");
      } else {
        // Handle case where API response is not successful
        setError(response?.message || "Update failed");
      }
    } catch (error) {
      console.error("Error updating contract text:", error);
      setError("Unknown Error Occurred. Please try again.");
    }
  };

  const handleCancel = async (e) => {
    e.preventDefault();
    Router.push("/dashboard");
  };
  if (!isClient) {
    return null;
  }

  return (
    <Form onSubmit={handleSubmit} className="w-100">
      {error && <div className="text-danger mt-2 mb-2">{error}</div>}
      <div className="text-muted m-2">{t("tooltips.contractTextnote")}</div>
      <Row className="mb-3">
        <Col className="">
          <ReactQuill
            value={htmlContent}
            onChange={setHtmlContent}
            modules={modules}
            formats={formats}
            className={`${error ? "border border-danger" : ""}`}
          />
        </Col>
      </Row>
      <Row className="mb-3">
        <Col>
          <Button type="submit" className="btn btn-primary me-2">
            {t("buttons.save")}
          </Button>
          <Button
            className="btn btn-danger"
            type="button"
            onClick={handleCancel}
          >
            {t("buttons.cancel")}
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default ContractText;

// // Test cases and logs
// console.log("initialContent", initialContent);
// console.log("!initialContent", !initialContent);
// console.log(`sanitizedInitialContent === "" `, sanitizedInitialContent === "");
// console.log(`initialContent.trim() === "" `, initialContent.trim() === "");
// console.log(

//   `initialContent.includes("<p><br></p>") `,
//   initialContent.includes("<p><br></p>")
// );
// console.log(
//   `^\s*<p>\s*<\/p>$/.test(initialContent) `,
//   /^\s*<p>\s*<\/p>$/.test(initialContent)
// );

// console.log("htmlContent", htmlContent);
// console.log("!htmlContent", !htmlContent);
// console.log(`sanitizedContent === "" `, sanitizedContent === "");
// console.log(`htmlContent.trim() === "" `, htmlContent.trim() === "");
// console.log(
//   `htmlContent.includes("<p><br></p>") `,
//   htmlContent.includes("<p><br></p>")
// );
// console.log(
//   `^\s*<p>\s*<\/p>$/.test(htmlContent) `,
//   /^\s*<p>\s*<\/p>$/.test(htmlContent)
// );
