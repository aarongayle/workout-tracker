import { useEffect, useState } from "react";
import Chart from "./chart";
import { db } from "./firebase";

function Container() {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
    >
      <App />
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState({});
  const [tables, setTables] = useState({});
  const [chart, setChart] = useState(null);
  const [addTablePopup, setAddTablePopup] = useState(false);
  const [newTableName, setNewTableName] = useState("");

  // Initialize newTableSchema with default fields
  const [newTableSchema, setNewTableSchema] = useState([
    "date",
    "weight",
    "sets",
    "reps",
  ]);
  const [newSchemaField, setNewSchemaField] = useState("");

  useEffect(() => {
    const userId = window.location.pathname.split("/")[1];
    setUser(userId);
  }, [window.location.pathname]);

  useEffect(() => {
    if (user) return;
    db()
      .ref("users")
      .on("value", (snapshot) => {
        setUsers(snapshot.val() || {});
      });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    db()
      .ref("tables")
      .child(user)
      .on("value", (snapshot) => {
        setTables(snapshot.val() || {});
      });
  }, [user]);

  if (!user) {
    return (
      <div style={{ padding: "1em" }}>
        <div
          style={{
            fontWeight: "bold",
            fontSize: "2em",
            color: "#fff",
            textAlign: "center",
            marginBottom: "1em",
            textTransform: "uppercase",
          }}
        >
          Users
        </div>
        <div>
          {Object.keys(users).map((user) => (
            <button
              onClick={() => (window.location.href = `/${user}`)}
              key={user}
              style={{
                width: "100%",
                fontSize: "1.5em",
                textTransform: "capitalize",
                padding: "1em",
                textAlign: "center",
                cursor: "pointer",
                borderRadius: "0.5em",
                marginBottom: "1em",
                color: "#fff",
                backgroundColor: "#444",
                border: "none",
                fontWeight: "bold",
              }}
            >
              {user}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (chart) {
    return (
      <Chart
        back={() => setChart(null)}
        tableKey={chart}
        values={tables[chart]}
        user={user}
      />
    );
  }

  // Function to remove a schema field
  const removeSchemaField = (index) => {
    setNewTableSchema(newTableSchema.filter((_, i) => i !== index));
  };

  return (
    <div
      style={{
        padding: "1em",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        flex: 1,
      }}
    >
      <div style={{ flex: 1 }}>
        {Object.keys(tables).map((table) => (
          <button
            key={table}
            onClick={() => setChart(table)}
            style={{
              width: "100%",
              padding: "1em",
              border: "none",
              borderRadius: "0.5em",
              marginBottom: "1em",
              textAlign: "center",
              fontSize: "1.5em",
              cursor: "pointer",
              textTransform: "uppercase",
              fontWeight: "bold",
              color: "#fff",
              backgroundColor: "#444",
            }}
          >
            {table}
          </button>
        ))}
      </div>
      <button
        onClick={() => setAddTablePopup(true)}
        style={{
          width: "100%",
          padding: "1em",
          border: "none",
          borderRadius: "0.5em",
          marginTop: "1em",
          textAlign: "center",
          fontSize: "1em",
          cursor: "pointer",
          textTransform: "uppercase",
          fontWeight: "bold",
          color: "#fff",
          backgroundColor: "#444",
        }}
      >
        Add Table
      </button>

      {addTablePopup && (
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
            <input
              type="text"
              placeholder="Enter table name"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
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

            {/* New input for schema field */}
            <input
              type="text"
              placeholder="Enter schema field"
              value={newSchemaField}
              onChange={(e) => setNewSchemaField(e.target.value)}
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
            <button
              onClick={() => {
                const field = newSchemaField.trim().toLowerCase();
                if (field && !newTableSchema.includes(field)) {
                  setNewTableSchema([...newTableSchema, field]);
                  setNewSchemaField("");
                } else if (newTableSchema.includes(field)) {
                  alert("Field already exists in the schema.");
                }
              }}
              style={{
                width: "100%",
                padding: "0.5em",
                marginBottom: "1em",
                borderRadius: "0.25em",
                border: "1px solid #555",
                backgroundColor: "#555",
                color: "#fff",
                cursor: "pointer",
                textAlign: "center",
                textTransform: "uppercase",
                fontWeight: "bold",
              }}
            >
              Add Field
            </button>

            {/* Display current schema fields with remove option */}
            <div style={{ marginBottom: "1em", color: "#fff" }}>
              <div style={{ fontWeight: "bold", marginBottom: "0.5em" }}>
                Schema Fields:
              </div>
              {newTableSchema.length === 0 ? (
                <div>No fields added.</div>
              ) : (
                <ul style={{ listStyleType: "none", padding: 0 }}>
                  {newTableSchema.map((field, index) => (
                    <li
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.5em",
                      }}
                    >
                      <span>{field}</span>
                      <button
                        onClick={() => removeSchemaField(index)}
                        style={{
                          padding: "0.2em 0.5em",
                          border: "none",
                          borderRadius: "0.25em",
                          cursor: "pointer",
                          backgroundColor: "#555",
                          color: "#fff",
                          textTransform: "uppercase",
                          fontWeight: "bold",
                        }}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <button
                onClick={() => {
                  setAddTablePopup(false);
                  setNewTableName("");
                  setNewSchemaField("");
                  setNewTableSchema(["date", "weight", "sets", "reps"]); // Reset to default schema
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
                  if (newTableName.trim() && newTableSchema.length > 0) {
                    db()
                      .ref("tables")
                      .child(user)
                      .child(newTableName.trim().toLowerCase())
                      .set({ schema: newTableSchema })
                      .then(() => {
                        setNewTableName("");
                        setNewSchemaField("");
                        setNewTableSchema(["date", "weight", "sets", "reps"]);
                        setAddTablePopup(false);
                      });
                  } else {
                    alert(
                      "Please provide a table name and at least one schema field."
                    );
                  }
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

export default Container;
