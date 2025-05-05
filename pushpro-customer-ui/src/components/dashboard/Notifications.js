const [notifications, setNotifications] = useState([]);

quickcall = async () => {
  try {
    const response = await service.get("/quick-notification");
    if (response?.success) setQuickNotifications(response?.data);
  } catch (error) {
    console.error(error);
  }
};

useEffect(() => {
  quickcall();

  const interval = setInterval(() => {
    quickcall();
  }, 60000);

  return () => clearInterval(interval);
}, []);

const handleNotificationClose = async (notifiation_id, project_id) => {
  try {
    const response = await service.patch(
      `/update-notification/${notifiation_id}`,
      {
        project_id,
        is_read: true
      }
    );
    if (response?.success) {
      quickcall();
    }
  } catch (error) {
    console.error("Error updating notification:", error);
  }
};

<Dropdown
  className="header-element notifications-dropdown"
  autoClose="outside"
  show={showDropdown}
  ref={dropdownRef}
>
  <Dropdown.Toggle
    as="a"
    variant=""
    className="header-link dropdown-toggle"
    data-bs-toggle="dropdown"
    data-bs-auto-close="outside"
    id="messageDropdown"
    onClick={handleToggleDropdown}
    aria-expanded={showDropdown ? "true" : "false"}
  >
    <i className="bx bx-bell header-link-icon"></i>
    <span
      className="badge bg-secondary rounded-pill header-icon-badge pulse pulse-secondary"
      id="notification-icon-badge"
    >
      {`${quickNotifications?.length ? quickNotifications.length : 0}`}
    </span>
  </Dropdown.Toggle>
  <Dropdown.Menu
    align="end"
    className="main-header-dropdown dropdown-menu dropdown-menu-end"
    data-popper-placement="none"
  >
    <div className="p-3">
      <div className="d-flex align-items-center justify-content-between">
        <p className="mb-0 fs-17 fw-semibold">
          {t("notificationForm.notificationTitle")}
        </p>
        <span className="badge bg-secondary-transparent" id="notifiation-data">
          {`${quickNotifications?.length} Unread`}
        </span>
      </div>
    </div>
    <Dropdown.Divider className="dropdown-divider"></Dropdown.Divider>
    <ul className="list-unstyled mb-0" id="header-notification-scroll">
      <PerfectScrollbar style={{ height: "200px" }}>
        {quickNotifications?.length === 0 ? (
          <div className="text-center">
            <span className="avatar avatar-xl avatar-rounded bg-secondary-transparent">
              <i className="ri-notification-off-line fs-2"></i>
            </span>
            <h6 className="fw-semibold mt-3">No New Notifications</h6>
          </div>
        ) : (
          quickNotifications.map((notification, index) => (
            <Dropdown.Item
              as="li"
              className="dropdown-item"
              key={notification.id}
            >
              <div className="d-flex align-items-start">
                <div className="pe-2">
                  <span
                    className={`avatar avatar-md bg-warning-transparent avatar-rounded`}
                  >
                    <i className={`ti ti-circle-check fs-18`}></i>
                  </span>
                </div>
                <div className="flex-grow-1 d-flex align-items-center justify-content-between text-wrap">
                  <div>
                    <p className="mb-0 fw-semibold">
                      <Link href={`/notifications`}>
                        {notification.type.title}
                      </Link>
                    </p>
                    <span className="text-muted fw-normal fs-12 header-notification-text">
                      Project Title :{" "}
                      {notification.project.title.length > 16
                        ? notification.project.title.substring(0, 16) + "..."
                        : notification.project.title}
                    </span>
                    <div className="text-muted fw-normal fs-12 header-notification-text">
                      Contractor Name :{" "}
                      {truncateName(
                        `${notification.project.contractor.first_name} ${notification.project.contractor.last_name}`
                      )}
                    </div>
                    {notification.link && (
                      <div
                        className="text-muted fw-normal fs-12 header-notification-text"
                        onClick={() =>
                          handleNotificationClose(
                            notification.id,
                            notification.project.id
                          )
                        }
                      >
                        Link :{" "}
                        <a
                          href={notification.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-info"
                        >
                          {" "}
                          <i className="bi bi-folder-symlink"></i>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Link
                    href="#!"
                    className="min-w-fit-content text-muted me-1 dropdown-item-close1"
                    onClick={() =>
                      handleNotificationClose(
                        notification.id,
                        notification.project.id
                      )
                    }
                  >
                    <i className="ti ti-x fs-16"></i>
                  </Link>
                </div>
              </div>
            </Dropdown.Item>
          ))
        )}
      </PerfectScrollbar>
    </ul>
    <div
      className={`p-3 empty-header-item1 border-top ${
        notifications.length === 0 ? "d-none" : "d-block"
      }`}
    >
      <div className="d-grid">
        <Link
          href={`/notifications`}
          className="btn btn-primary"
          onClick={() => setShowDropdown(false)}
        >
          {t("buttons.viewAll")}
        </Link>
      </div>
    </div>
    <div
      className={`p-5 empty-item1 ${
        notifications.length === 0 ? "d-block" : "d-none"
      }`}
    >
      <div className="text-center">
        <div className="d-grid">
          <Link
            href={`/notifications`}
            className="btn btn-primary"
            onClick={() => setShowDropdown(false)}
          >
            View All
          </Link>
        </div>
      </div>
    </div>
  </Dropdown.Menu>
</Dropdown>;
