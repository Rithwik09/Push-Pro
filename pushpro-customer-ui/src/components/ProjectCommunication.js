import React, { useEffect, useRef, useState, useCallback } from "react";
import { Card, InputGroup, Spinner } from "react-bootstrap";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";
import useService from "@/hooks/useService";
import { quickcall } from "@shared/layout-components/header/header";
import { assetPrefix } from "../../next.config";

const ProjectCommunication = (props) => {
  const { t } = useTranslation();
  const router = useRouter();
  const service = useService();
  const [id, setId] = useState(props.id);
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(props.id);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [rightSideContent, setRightSideContent] = useState(null);
  const [leftSideChat, setLeftSideChat] = useState(null);
  const [uploadAttachment, setUploadAttachment] = useState(null);
  const [isFetchingRightSideData, setIsFetchingRightSideData] = useState(false);
  const [contId, setContId] = useState();
  const s3BasePath = process.env.NEXT_PUBLIC_BASE_S3_PATH || "";
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const urlId = router.query.id;
  const chatContentRef = useRef(null);

  useEffect(() => {
    const contractorId = localStorage.getItem("currentContractor");
    setContId(contractorId);
    setId(urlId);
  }, [urlId]);

  useEffect(() => {
    if (id && contId) {
      fetchRightSideData(id);
      leftSideChatData();
    }
  }, [id, contId]);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        await fetchRightSideData(id);
        quickcall();
      } else if (selectedChatId) {
        await fetchRightSideData(selectedChatId);
        quickcall();
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, [id, selectedChatId]);

  useEffect(() => {
    if (!isFetchingRightSideData && rightSideContent) {
      const selectedData = rightSideContent.find(
        (chat) => chat.project_id === selectedChatId
      );
      if (selectedData) {
        setSelectedChat(selectedData);
        setSelectedChatId(selectedData.project_id);
      }
    }
  }, [isFetchingRightSideData, rightSideContent, selectedChatId]);

  useEffect(() => {
    scrollToBottom();
  }, [rightSideContent]);

  const leftSideChatData = useCallback(async () => {
    try {
      const response = await service.post(
        "/my-projects/last-chat-with-project",
        { contractorId: contId }
      );
      console.log("left side" , response);
      setSelectedChatId(response.data[0].project.id);
      setLeftSideChat(response.data);
    } catch (error) {
      console.error(error);
    }
  }, [contId, service]);

  const fetchRightSideData = useCallback(
    async (id) => {
      try {
        setIsFetchingRightSideData(true);
        const response = await service.get(
          `/my-projects/project-communications/${id}`
        );
        if (response?.success) {
          const processedData = processApiResponse(response?.data);
          const selectedData = processedData.find(
            (chat) => chat.project_id === id
          );
          setRightSideContent(processedData);
          setSelectedChat(selectedData);
          scrollToBottom();
        } else {
          console.error("No data received from the server");
        }
      } catch (error) {
        console.error("Error Fetching Right Side Chat Data:", error);
      } finally {
        setIsFetchingRightSideData(false);
      }
    },
    [service]
  );

  const handleChatClick = useCallback(
    async (selectedChatId) => {
      setSelectedChat(null);
      setSelectedChatId(selectedChatId);
      await fetchRightSideData(selectedChatId);
      const newUrl = `${basePath}/project-communication/${selectedChatId}`;
      window.history.pushState({ path: newUrl }, "", newUrl);
      setId(selectedChatId);
    },
    [basePath, fetchRightSideData]
  );

  const handleFileUpload = useCallback((files) => {
    if (files.length > 0) {
      const uploadedFiles = Array.from(files).map((file) => ({
        name: file.name,
        file: file
      }));
      setSelectedFiles(uploadedFiles);
    }
  }, []);

  const handleChatTyping = (e) => {
    setNewMessage(e.target.value);
  };

  const handleChatSubmit = useCallback(async () => {
    try {
      if (selectedChat?.senderId || selectedChat?.receiverId) {
        const trimmedMessage = newMessage.trim();
        if (trimmedMessage !== "" || selectedFiles.length > 0) {
          const formData = new FormData();
          formData.append("project_id", selectedChatId);
          formData.append("sender_id", selectedChat.senderId);
          formData.append("receiver_id", selectedChat.receiverId);
          formData.append("message", newMessage);
          selectedFiles.forEach((file) =>
            formData.append("attachment", file.file)
          );

          await service.post("/my-projects/project-communications", formData, {
            headers: { "Content-Type": "multipart/form-data" }
          });

          fetchRightSideData(selectedChatId);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setNewMessage("");
      setSelectedFiles([]);
      setUploadAttachment(null);
    }
  }, [
    selectedChat,
    selectedChatId,
    selectedFiles,
    newMessage,
    service,
    fetchRightSideData
  ]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (selectedChat?.senderId || selectedChat?.receiverId) {
        handleChatSubmit();
        scrollToBottom();
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const processApiResponse = (response) => {
    return response
      .map((item) => {
        const attachmentName = item.attachment
          ? item.attachment.split("_").pop()
          : "";
        const hasMessageOrAttachment = item.message || item.attachment;
        const isSenderCustomer = item.sender_id === item.project.customer_id;
        const isReceiverContractor =
          item.receiver_id === item.project.contractor_id;
        if (hasMessageOrAttachment) {
          return {
            type: isSenderCustomer ? "to" : "from",
            status: isSenderCustomer ? "" : "chatstatusperson",
            name: isSenderCustomer
              ? item.receiver.first_name
              : item.sender.first_name,
            time: formatMessageTime(item.createdAt),
            img: isSenderCustomer
              ? item.receiver.profile_url
              : item.sender.profile_url,
            messages: item.message ? [item.message] : [],
            files: item.attachment
              ? [
                  {
                    url: `${s3BasePath}${item.attachment}`,
                    name: attachmentName
                  }
                ]
              : [],
            receiver: isReceiverContractor
              ? item.receiver.first_name + " " + item.receiver.last_name
              : item.sender.first_name + " " + item.sender.last_name,
            receiverId: isReceiverContractor
              ? item.receiver.id
              : item.sender.id,
            senderId: isSenderCustomer ? item.sender.id : item.receiver.id,
            project_title: item.project.title,
            project_id: item.project_id
          };
        } else {
          return {
            receiver: isReceiverContractor
              ? item.receiver.first_name + " " + item.receiver.last_name
              : item.sender.first_name + " " + item.sender.last_name,
            receiverId: isReceiverContractor
              ? item.receiver.id
              : item.sender.id,
            senderId: isSenderCustomer ? item.sender.id : item.receiver.id,
            project_title: item.project.title,
            img: isSenderCustomer
              ? item.receiver.profile_url
              : item.sender.profile_url,
            project_id: item.project_id
          };
        }
      })
      .filter(Boolean);
  };

  const scrollToBottom = () => {
    if (chatContentRef.current) {
      setTimeout(() => {
        if (chatContentRef.current) {
          chatContentRef.current.scrollTop =
            chatContentRef.current.scrollHeight;
        }
      }, 100);
    }
  };

  const filteredChats = leftSideChat?.filter((chat) => {
    const projectTitleMatch = chat.project.title
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const lastMessageMatch = chat.lastCommunication?.message
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    return projectTitleMatch || lastMessageMatch;
  });

  const formatMessageTime = (timestamp) => {
    const currentDate = new Date();
    const messageDate = new Date(timestamp);
    const hoursDiff = Math.abs(currentDate - messageDate) / 36e5;
    if (hoursDiff < 24) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
    } else if (hoursDiff >= 24 && hoursDiff < 48) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  return (
    <>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <Card.Title>{t("projectChat.projectCommunication")}</Card.Title>
      </Card.Header>
      <Card.Body>
        <div className="container-fluid">
          <div className="main-chart-wrapper p-2 gap-2 d-lg-flex">
            <div className="chat-info border">
              <div className="d-flex align-items-center justify-content-between w-100 p-3 border-bottom">
                <h5 className="fw-semibold mb-0">{t("dashboard.projects")}</h5>
              </div>
              <div className="chat-search p-3 border-bottom">
                <InputGroup>
                  <input
                    type="text"
                    className="form-control bg-light border-0"
                    placeholder={t("projectChat.searchProjects")}
                    aria-describedby="button-addon2"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  <a
                    aria-label="button"
                    className="btn btn-light"
                    type="button"
                    id="button-addon2"
                  >
                    <i className="ri-search-line"></i>
                  </a>
                </InputGroup>
              </div>
              <div className="border-0 chat-users-tab">
                <PerfectScrollbar>
                  <ul
                    className="list-unstyled mb-0 mt-2 chat-users-tab"
                    id="chat-msg-scroll"
                  >
                    <li className="pb-0">
                      <p className="fs-11 fw-semibold mb-2 op-7">
                        {t("projectChat.allChats")}
                      </p>
                    </li>
                    {filteredChats?.map((chat) => (
                      <li
                        key={chat.project.id}
                        className={`cursor-pointer transition-all duration-300 ease-in-out ${
                          selectedChat &&
                          selectedChat.project_id === chat.project.id
                            ? "bg-primary-light"
                            : ""
                        }`}
                        onClick={() => handleChatClick(chat.project.id)}
                      >
                        <Link href="#!" className="block">
                          <div className="d-flex bg-outline-primary rounded-2 hover-effect align-items-top p-2">
                            <div className="flex-fill">
                              <p className="fw-semibold">
                                {chat.project.title}{" "}
                                <span className="float-end fw-normal fs-11">
                                  {chat.lastCommunication?.createdAt
                                    ? formatMessageTime(
                                        chat.lastCommunication?.createdAt
                                      )
                                    : ""}
                                </span>
                              </p>
                              <p className="fs-12 mb-0">
                                <span className="chat-msg text-truncate">
                                  {chat.lastCommunication?.message ||
                                    chat.lastCommunication?.attachment
                                      ?.split("_")
                                      .pop()}
                                </span>
                              </p>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </PerfectScrollbar>
              </div>
            </div>
            <div className="main-chat-area border">
              <div className="d-flex align-items-center chatHeaderLightBackground p-2 border-bottom">
                {selectedChat?.receiver && (
                  <span className="avatar avatar-lg  me-2 avatar-rounded chatstatusperson">
                    <img
                      className="chatimageperson"
                      src={
                        selectedChat.img
                          ? `${s3BasePath}${selectedChat.img}`
                          : `${assetPrefix}/assets/images/imgs/no_user_image.png`
                      }
                      alt="img"
                    />
                  </span>
                )}
                <div className="flex-fill">
                  <p className="mb-0 fw-semibold fs-14">
                    {selectedChat ? (
                      <a
                        href="#!"
                        className="chatnameperson responsive-userinfo-open"
                      >
                        {selectedChat.receiver}
                      </a>
                    ) : (
                      <Spinner variant="primary" animation="border" size="md" />
                    )}
                  </p>
                  <p className="mb-0 chatpersonstatus">
                    {selectedChat ? selectedChat.project_title : ""}
                  </p>
                </div>
              </div>
              <div className="chat-content p-0" id="main-chat-content">
                <PerfectScrollbar
                  containerRef={(ref) => {
                    chatContentRef.current = ref;
                  }}
                  options={{ suppressScrollX: true }}
                  onYReachEnd={scrollToBottom}
                >
                  <ul className="list-unstyled chat-content">
                    {rightSideContent &&
                      rightSideContent.map((chatMsg, index) => (
                        <li key={index} className="mb-3">
                          <div
                            className={`chat-list-inner d-flex ${
                              chatMsg.type === "to"
                                ? "justify-content-end chat-item-end"
                                : "justify-content-start chat-item-start"
                            }`}
                          >
                            {chatMsg.type === "from" && (
                              <div className="chat-user-profile me-3">
                                <span
                                  className={`avatar avatar-md avatar-rounded ${chatMsg.status}`}
                                >
                                  <img
                                    className="chatimageperson"
                                    src={
                                      selectedChat?.img
                                        ? `${s3BasePath}${selectedChat.img}`
                                        : `${assetPrefix}/assets/images/imgs/no_user_image.png`
                                    }
                                    alt="img"
                                  />
                                </span>
                              </div>
                            )}
                            <div
                              className={`${
                                chatMsg.type === "to"
                                  ? "text-end"
                                  : "text-start"
                              }`}
                            >
                              <span className="chatting-user-info d-block">
                                {chatMsg.type === "to" && (
                                  <>
                                    <span className="msg-sent-time fw-semibold fs-14 ms-2">
                                      {"You"}
                                    </span>
                                    <span className="chatnameperson msg-sent-time">
                                      {chatMsg.time}
                                    </span>
                                  </>
                                )}
                                {chatMsg.type === "from" && (
                                  <>
                                    <span className="chatnameperson fw-semibold fs-14">
                                      {chatMsg.name}
                                    </span>
                                    <span className="msg-sent-time ms-2">
                                      {chatMsg.time}
                                    </span>
                                  </>
                                )}
                              </span>
                              <div className="main-chat-msg">
                                {chatMsg.messages?.map((msg, i) => (
                                  <div key={i}>
                                    {msg?.split("\n").map((line, index) => (
                                      <p key={index} className="mb-0">
                                        {line.length > 60
                                          ? line
                                              .match(/.{1,60}/g)
                                              .map((segment, segmentIndex) => (
                                                <span key={segmentIndex}>
                                                  {segment}
                                                  <br />
                                                </span>
                                              ))
                                          : line}
                                      </p>
                                    ))}
                                  </div>
                                ))}
                                {chatMsg.files &&
                                  chatMsg.files.map((file, i) => (
                                    <div
                                      key={i}
                                      className="mb-0 d-sm-flex d-block"
                                    >
                                      <a
                                        href={file.url}
                                        download={file.name}
                                        className="m-0 main-chat-msg"
                                      >
                                        {file.name}
                                        <i className="bi bi-cloud-download m-0 ms-2"></i>{" "}
                                      </a>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                  </ul>
                </PerfectScrollbar>
              </div>
              <div className="chat-footer chatHeaderLightBackground row gy-1 m-0">
                <div className="col-12">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="selected-file chat-file">
                      <span className="">{file.name}</span>
                      <i
                        className="remove-file-btn text-danger bi bi-x-circle"
                        onClick={() =>
                          setSelectedFiles(
                            selectedFiles.filter((_, i) => i !== index)
                          )
                        }
                      ></i>
                    </div>
                  ))}
                </div>
                <div className="col-12 d-flex pb-2">
                  <input
                    className="form-control"
                    placeholder={t("projectChat.typeMessage")}
                    type="text"
                    onChange={handleChatTyping}
                    value={newMessage}
                    onKeyDown={handleKeyPress}
                  />
                  <label
                    htmlFor="file-upload"
                    className="btn btn-icon mx-2 btn-success"
                  >
                    <i className="ri-attachment-line"></i>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    className="d-none"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                  <a
                    aria-label="anchor"
                    className="btn btn-primary btn-icon btn-send"
                    href="#!"
                  >
                    <i
                      className="ri-send-plane-2-line"
                      onClick={handleChatSubmit}
                    ></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card.Body>
    </>
  );
};

export default ProjectCommunication;
