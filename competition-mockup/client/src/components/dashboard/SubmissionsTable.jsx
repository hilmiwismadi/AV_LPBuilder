import React, { useEffect, useState } from "react";
import StatusBadge from "../shared/StatusBadge";
import api from "../../services/api";
import { colors } from "../../utils/colors";

const SubmissionsTable = () => {
  const [submissions, setSubmissions] = useState([]);
  const [scoring, setScoring] = useState({});

  const handleScoreUpdate = (id, score) => {
    api.put("/dashboard/submissions/" + id, { 
      score: parseInt(score), 
      status: "Scored" 
    })
      .then(res => {
        setSubmissions(submissions.map(s => 
          s.id === id ? { ...s, score: parseInt(score), status: "Scored" } : s
        ));
        setScoring({ ...scoring, [id]: "" });
      })
      .catch(err => console.error("Error updating score:", err));
  };

  useEffect(() => {
    api.get("/dashboard/submissions")
      .then(res => setSubmissions(res.data))
      .catch(err => console.error("Error:", err));
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Competition Submissions</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Submission
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {submissions.map(submission => (
              <tr key={submission.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {submission.participantName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {submission.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <a 
                    href={submission.submissionLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                    style={{ color: colors.primary.purple }}
                  >
                    View Link
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {submission.score !== null ? submission.score : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={submission.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <a
                    href={submission.gdriveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 rounded-lg text-sm inline-block"
                    style={{ 
                      backgroundColor: "#DBEAFE",
                      color: "#1E40AF" 
                    }}
                  >
                    View in GDrive
                  </a>
                  {submission.status === "Pending Review" && (
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Score"
                        className="w-20 px-2 py-1 border rounded text-sm"
                        value={scoring[submission.id] || ""}
                        onChange={(e) => setScoring({...scoring, [submission.id]: e.target.value})}
                      />
                      <button
                        onClick={() => handleScoreUpdate(submission.id, scoring[submission.id])}
                        className="px-3 py-1 text-white rounded-lg text-sm"
                        style={{ backgroundColor: colors.primary.purple }}
                      >
                        Submit
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubmissionsTable;
