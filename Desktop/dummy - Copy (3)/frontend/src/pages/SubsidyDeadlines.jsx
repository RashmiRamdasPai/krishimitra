import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function SubsidyDeadlines() {
  const { username } = useParams();
  const [deadlines, setDeadlines] = useState([]);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/subsidy/deadlines/${username}`)
      .then((res) => res.json())
      .then((data) => setDeadlines(data.deadlines));
  }, [username]);

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold text-green-700 mb-4">📅 Subsidy Deadlines</h1>

      {deadlines.length === 0 ? (
        <p>No deadlines saved.</p>
      ) : (
        <div className="space-y-4">
          {deadlines.map((d) => (
            <div key={d._id} className="p-4 bg-white shadow rounded">
              <h3 className="text-lg font-bold">{d.subsidy_name}</h3>
              <p className="text-gray-700">Deadline: {d.deadline}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
