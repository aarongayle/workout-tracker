import { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import { db } from "../firebase";

export default function Chart({ back, tableKey, values, user }) {
  const [newValuePopup, setNewValuePopup] = useState(false);

  // State to hold form data
  const [formData, setFormData] = useState({});

  // Extract the schema from the table's values
  const schema = values.schema || [];

  // Filter out the 'schema' entry from the values
  const dataEntries = Object.entries(values).filter(
    ([key]) => key !== "schema"
  );

  // Sort the data entries by date (assuming 'date' is a field)
  const sortedData = dataEntries.sort((a, b) => a[1].date - b[1].date);

  // Function to format date to 'YYYY-MM-DDTHH:MM' in local time
  const formatDateForInput = (date) => {
    const pad = (num) => String(num).padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // Months are zero-indexed
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Set default date when the popup opens
  useEffect(() => {
    if (newValuePopup) {
      setFormData((prevData) => ({
        ...prevData,
        date: formatDateForInput(new Date()),
      }));
    }
  }, [newValuePopup]);

  return (
    <div style={{ padding: "1em" }}>
      <div style={{ display: "flex", marginBottom: "1em" }}>
        <button
          onClick={back}
          style={{
            flex: 1,
            margin: "0.5em",
            padding: "1em",
            border: "none",
            borderRadius: "0.5em",
            cursor: "pointer",
            color: "#fff",
            backgroundColor: "#444",
            textAlign: "center",
            textTransform: "uppercase",
            fontWeight: "bold",
          }}
        >
          Back
        </button>
        <button
          onClick={() => setNewValuePopup(true)}
          style={{
            flex: 1,
            margin: "0.5em",
            padding: "1em",
            border: "none",
            borderRadius: "0.5em",
            cursor: "pointer",
            color: "#fff",
            backgroundColor: "#444",
            textAlign: "center",
            textTransform: "uppercase",
            fontWeight: "bold",
          }}
        >
          Add
        </button>
      </div>

      {/* Plotting the data */}
      <Plot
        style={{ width: "100%" }}
        useResizeHandler={true}
        data={[
          {
            x: sortedData.map(([, entry]) => new Date(entry.date)),
            y: sortedData.map(([, entry]) => parseFloat(entry.weight)), // Change 'weight' to the field you want to plot
            type: "scatter",
            mode: "lines+markers",
            marker: { color: "#1E90FF" },
          },
        ]}
        layout={{
          height: 240,
          title: {
            text: tableKey,
            font: { color: "#fff" },
          },
          paper_bgcolor: "#222",
          plot_bgcolor: "#222",
          xaxis: { color: "#fff" },
          yaxis: { color: "#fff" },
        }}
        config={{ displayModeBar: false }}
      />

      {newValuePopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#333",
              padding: "2em",
              borderRadius: "0.5em",
              width: "90%",
              maxWidth: "400px",
              boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
            }}
          >
            {/* Dynamically render input fields based on the schema */}
            {schema.map((field) => (
              <input
                key={field}
                type={field === "date" ? "datetime-local" : "text"}
                placeholder={`Enter ${field}`}
                value={
                  formData[field] ||
                  (field === "date" ? formatDateForInput(new Date()) : "")
                }
                onChange={(e) =>
                  setFormData({ ...formData, [field]: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "0.5em",
                  marginBottom: "1em",
                  borderRadius: "0.25em",
                  border: "1px solid #555",
                  backgroundColor: "#444",
                  color: "#fff",
                }}
              />
            ))}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <button
                onClick={() => {
                  setNewValuePopup(false);
                  setFormData({});
                }}
                style={{
                  flex: 1,
                  margin: "0.5em",
                  padding: "1em",
                  border: "none",
                  borderRadius: "0.5em",
                  cursor: "pointer",
                  color: "#fff",
                  backgroundColor: "#555",
                  textAlign: "center",
                  textTransform: "uppercase",
                  fontWeight: "bold",
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Validate that all fields are filled
                  const allFieldsFilled = schema.every(
                    (field) => formData[field] && formData[field].trim() !== ""
                  );

                  if (!allFieldsFilled) {
                    alert("Please fill out all fields.");
                    return;
                  }

                  // Parse the date from the input as local time
                  const dateValue = formData.date;
                  const [datePart, timePart] = dateValue.split("T");
                  const [year, month, day] = datePart.split("-");
                  const [hours, minutes] = timePart.split(":");

                  const dateObject = new Date(
                    Number(year),
                    Number(month) - 1, // Months are zero-indexed
                    Number(day),
                    Number(hours),
                    Number(minutes)
                  );

                  // Convert date to epoch timestamp
                  const dataToPush = {
                    ...formData,
                    date: dateObject.getTime(),
                  };

                  db()
                    .ref()
                    .child("tables")
                    .child(user)
                    .child(tableKey)
                    .push(dataToPush);

                  setNewValuePopup(false);
                  setFormData({});
                }}
                style={{
                  flex: 1,
                  margin: "0.5em",
                  padding: "1em",
                  border: "none",
                  borderRadius: "0.5em",
                  cursor: "pointer",
                  color: "#fff",
                  backgroundColor: "#555",
                  textAlign: "center",
                  textTransform: "uppercase",
                  fontWeight: "bold",
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
