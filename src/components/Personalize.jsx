import { useState } from "react";

const interests = [
  {
    id: "fitness",
    label: "Running & Fitness",
    description: "Outdoor workouts and activity",
  },
  {
    id: "health",
    label: "Health & Air",
    description: "Air quality and comfort",
  },
  {
    id: "commute",
    label: "Commute",
    description: "Getting around comfortably",
  },
  {
    id: "family",
    label: "Family & School",
    description: "Planning the day outside",
  },
  {
    id: "travel",
    label: "Travel",
    description: "Trips and outdoor plans",
  },
  {
    id: "farming",
    label: "Farming & Garden",
    description: "Plants, soil and moisture",
  },
  {
    id: "beach",
    label: "Beach & Outdoors",
    description: "Sun and outdoor conditions",
  },
  {
    id: "events",
    label: "Events",
    description: "Outdoor plans and gatherings",
  },
];

function getSavedInterests() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("mausam-interests") || "[]"
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function Personalize({ onComplete }) {
  const [selected, setSelected] = useState(
    getSavedInterests
  );

  function toggleInterest(id) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function finish() {
    localStorage.setItem(
      "mausam-interests",
      JSON.stringify(selected)
    );

    onComplete(selected);
  }

  function skip() {
    localStorage.setItem(
      "mausam-interests",
      JSON.stringify([])
    );

    onComplete([]);
  }

  return (
    <main className="personalize">
      <div className="personalize-inner">
        <p className="eyebrow personalize-eyebrow">
          PERSONALIZE MAUSAM
        </p>

        <h1>What matters to you?</h1>

        <p className="personalize-description">
          Pick a few things you care about. Mausam will use
          them to make your weather more useful.
        </p>

        <div className="interest-list">
          {interests.map((interest) => {
            const isSelected =
              selected.includes(interest.id);

            return (
              <button
                key={interest.id}
                className={`interest ${
                  isSelected ? "selected" : ""
                }`}
                onClick={() =>
                  toggleInterest(interest.id)
                }
              >
                <span className="interest-copy">
                  <strong>{interest.label}</strong>
                  <small>{interest.description}</small>
                </span>

                <span className="interest-check">
                  {isSelected ? "✓" : "+"}
                </span>
              </button>
            );
          })}
        </div>

        <div className="personalize-actions">
          <button
            className="continue-button"
            onClick={finish}
            disabled={selected.length === 0}
          >
            Continue →
          </button>

          <button
            className="skip-button"
            onClick={skip}
          >
            Skip for now
          </button>
        </div>

        <p className="personalize-note">
          You can change this later.
        </p>
      </div>
    </main>
  );
}

export default Personalize;