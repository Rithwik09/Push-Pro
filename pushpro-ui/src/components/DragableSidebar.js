import React, { useEffect, useState, useCallback } from "react";
import { Accordion, Button, Form, Dropdown } from "react-bootstrap";
import Draggable from "react-draggable";
import useService from "@/hooks/useService";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

const DraggableItem = ({ category, subcategories, eventKey, onDragStop }) => {
  const initialPositions = Array(subcategories.length).fill({ x: 0, y: 0 });
  const [positions, setPositions] = useState(initialPositions);
  const [draggingIndex, setDraggingIndex] = useState(null);

  const onDrag = (e, data, index) => {
    const newX = data.x;
    const newY = data.y;
    const newPositions = [...positions];
    newPositions[index] = { x: newX, y: newY };
    setPositions(newPositions);
    setDraggingIndex(index);
  };

  const onStop = (e, data, index) => {
    const dragData = {
      category,
      subCategory: subcategories[index],
      index
    };
    onDragStop(dragData);
    setPositions(initialPositions);
    setDraggingIndex(null);
  };

  return (
    <Accordion.Item eventKey={eventKey}>
      <Accordion.Header style={{ zIndex: "auto" }}>{category}</Accordion.Header>
      <Accordion.Body>
        <div
          className="custom-accordion-body"
          style={{
            position: "relative",
            overflow: "auto",
            height: "auto"
          }}
        >
          {subcategories.map((subCategory, index) => (
            <Draggable
              key={index}
              onDrag={(e, data) => onDrag(e, data, index)}
              onStop={(e, data) => onStop(e, data, index)}
              position={positions[index]}
            >
              <div
                className="custom-draggable-item border rounded border-1 p-2 my-1 d-flex align-items-center justify-content-between"
                style={{
                  zIndex: draggingIndex === index ? 1000 : "auto",
                  position: "relative"
                }}
              >
                <div className="custom-draggable-item">{subCategory.name}</div>
                <i className="ri-drag-move-2-fill me-4"></i>
              </div>
            </Draggable>
          ))}
        </div>
      </Accordion.Body>
    </Accordion.Item>
  );
};

const DraggableSidebar = ({ onToggle, onDataDragStop }) => {
  const service = useService();
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Library Items");
  const [items, setItems] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const router = useRouter();
  const { t } = useTranslation();

  const fetchItems = useCallback(async (url) => {
    try {
      const condition = {};
      if (searchTerm) {
        condition.title = searchTerm;
      }
      const response = await service.post(url, {
        pageNo: currentPage,
        limit: pageSize,
        search: "",
        condition: condition
      });
      if (response?.success) {
        setItems(response?.data?.items);
      }
    } catch (error) {
      console.error("Error Fetching Items :", error);
    }
  });

  const handleSelect = (option) => {
    setSelectedOption(option);
    let url = "";
    switch (option) {
      case "Library Items":
        url = "projects/library-items";
        break;
      case "My Items":
        url = "myprofile/contractor-items";
        break;
      default:
        url = "projects/library-items";
        break;
    }
    fetchItems(url);
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
    onToggle(!showSidebar);
  };

  const updateIsMobile = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  const handleAddNewItem = () => {
    router.push("/items/add");
  };

  useEffect(() => {
    fetchItems("projects/library-items");
    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);
    return () => {
      window.removeEventListener("resize", updateIsMobile);
    };
  }, []);

  return (
    <div>
      <Button
        onClick={toggleSidebar}
        className={`toggle-btn ri-arrow-right-s-line ${
          isMobile ? "sidebar-mobile-sizing" : "sidebar-sizing"
        }`}
      ></Button>
      {showSidebar && (
        <div
          className={`border border-1 col-3 rounded m-0 custom-sidebar-size ${
            showSidebar ? "sidebar-open" : "sidebar-closed"
          } ${isMobile ? "sidebar-mobile-sizing" : "sidebar-sizing"}`}
        >
          <div className="box-white p-2">
            <div className="col-12 d-flex justify-content-between align-items-center">
              <Form.Label
                htmlFor="search"
                className="fs-14 ms-2 mb-0 text-white fw-bold"
              >
                Add
                {/* {t("buttons.add")} */}
              </Form.Label>
              <Button
                onClick={toggleSidebar}
                className="toggle-btn ri-arrow-right-s-line m-0 border-0"
              ></Button>
            </div>
            <div className="col-11">
              <Form.Group className="mb-3 ms-2">
                <Form.Control
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search By Item Name"
                />
              </Form.Group>
            </div>
            <div className="btn-group col-12">
              <Dropdown>
                <Dropdown.Toggle
                  className="btn btn-primary dropdown-toggle"
                  type="button"
                  id="defaultDropdown"
                  data-bs-toggle="dropdown"
                  data-bs-auto-close="true"
                  aria-expanded="false"
                >
                  {selectedOption}
                </Dropdown.Toggle>
                <Dropdown.Menu
                  className="dropdown-menu"
                  as="ul"
                  aria-labelledby="defaultDropdown"
                >
                  <Dropdown.Item
                    as="li"
                    onClick={() => handleSelect("Library Items")}
                  >
                    Library Items
                  </Dropdown.Item>
                  <Dropdown.Item
                    as="li"
                    onClick={() => handleSelect("My Items")}
                  >
                    My Items
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <Button
                onClick={handleAddNewItem}
                className="btn border border-2 rounded-2"
              >
                New Item +
              </Button>
            </div>
          </div>
          <div
            className="scrollable-accordion"
            style={{ height: "50vh", maxHeight: "", overflowY: "auto" }}
          >
            <Accordion defaultActiveKey="0">
              {Object.keys(items).map((category, index) => (
                <DraggableItem
                  key={index}
                  eventKey={index.toString()}
                  category={category}
                  subcategories={Object.values(items[category])}
                  onDragStop={onDataDragStop}
                />
              ))}
            </Accordion>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraggableSidebar;
