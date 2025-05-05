import { useRouter } from "next/router";
import React from "react";
import { Card } from "react-bootstrap";

const Meetings = ({ schedules }) => {
  const router = useRouter();

  const handleSchedule = (id) => {
    router.push(`/project-schedule/${id}`);
  };
  return (
    <Card className="custom-card w-50">
      <Card.Header className="d-flex w-100 justify-content-between">
        <Card.Title className="mb-3 mb-lg-0 col-8">
          Upcoming Meetings
        </Card.Title>
      </Card.Header>
      <Card.Body>
        {schedules.length === 0 ? (
          <div className="text-center mt-3">
            <p>No Records Found!</p>
          </div>
        ) : (
          <div className="row">
            <div
              className="table-responsive rounded p-0"
              style={{ maxHeight: "400px", overflowY: "auto" }}
            >
              <table className="table table-bordered border text-muted border-2 rounded">
                <thead>
                  <tr>
                    <th>Contractor</th>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Timings</th>
                    <th>{t("project.status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((schedule) => (
                    <tr key={schedule.id}>
                      <td
                        onClick={() => handleSchedule(schedule.project_id)}
                        style={{ cursor: "pointer" }}
                      >
                        {schedule.customer_name}
                      </td>
                      <td>{schedule.title}</td>
                      <td>
                        {new Date(schedule.start_time).toLocaleDateString(
                          "en-GB"
                        )}{" "}
                        -
                        {new Date(schedule.end_time).toLocaleDateString(
                          "en-GB"
                        )}
                      </td>
                      <td>
                        {new Date(schedule.start_time).toLocaleString("en-US", {
                          hour: "numeric",
                          minute: "numeric",
                          hour12: true
                        })}{" "}
                        -
                        {new Date(schedule.end_time).toLocaleString("en-US", {
                          hour: "numeric",
                          minute: "numeric",
                          hour12: true
                        })}
                      </td>
                      <td>{schedule.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default Meetings;
