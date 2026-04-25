import React, { useState } from "react";
import { useStaticRender } from "../src/hooks/useStaticRender";

/**
 * A "Heavy" button component to test prop passing and hydration.
 */
const HeavyButton = ({
  variant = "contained",
  color = "blue",
  onClick,
  children,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: any) => {
  // Simulate heavy computation
  const start = performance.now();
  while (performance.now() - start < 100) {}

  return (
    <button
      onClick={onClick}
      {...rest}
      style={{
        padding: "10px 20px",
        backgroundColor: variant === "contained" ? color : "transparent",
        color: variant === "contained" ? "white" : color,
        border: `2px solid ${color}`,
        borderRadius: "8px",
        cursor: "pointer",
        margin: "5px",
        ...rest.style,
      }}
    >
      {children}
    </button>
  );
};

export default function App() {
  const [clickCount, setClickCount] = useState(0);
  const [hydrationDelay, setHydrationDelay] = useState(500);

  // 1. Setup static render with a base template
  // We use the hydrationDelay state to test if the stability holds when options change
  const { StaticItem } = useStaticRender(
    <HeavyButton variant="contained" color="darkcyan" />,
    { hydrationDelay, displayContents: true },
  );

  const items = Array.from({ length: 20 }, (_, i) => `Button ${i + 1}`);

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "system-ui, sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <h1>🧪 Test: Stabilité & Accessibilité</h1>

      <div
        style={{
          background: "#f8f9fa",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "20px",
          border: "1px solid #dee2e6",
        }}
      >
        <p>
          Clicks totaux : <strong>{clickCount}</strong>
        </p>
        <label>
          Délai d'hydratation (ms) :
          <input
            type="number"
            value={hydrationDelay}
            onChange={(e) => setHydrationDelay(Number(e.target.value))}
            style={{ marginLeft: "10px", padding: "5px", width: "80px" }}
          />
        </label>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          padding: "20px",
          background: "#e9ecef",
          borderRadius: "12px",
        }}
      >
        {items.map((text, i) => (
          <div key={i}>
            <StaticItem onClick={() => setClickCount((prev) => prev + 1)}>
              {text}
            </StaticItem>
            {/* 
            <HeavyButton onClick={() => setClickCount((prev) => prev + 1)}>
              {text}
            </HeavyButton> */}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "40px", lineHeight: "1.6" }}>
        <h3>🛠️ Scénarios de Test :</h3>

        <h4>1. Test de Stabilité (Performance)</h4>
        <ol>
          <li>
            Règle le délai à <strong>2000ms</strong> pour bien voir l'attente.
          </li>
          <li>
            Survole un bouton, attends qu'il devienne interactif (il change
            légèrement de teinte ou tu peux le cliquer).
          </li>
          <li>
            Clique sur le bouton. Le compteur en haut augmente, provoquant un
            re-render de toute la page.
          </li>
          <li>
            <strong>Vérification :</strong> Le bouton ne doit PAS redevenir
            statique. Si tu cliques à nouveau immédiatement, le compteur doit
            augmenter SANS attendre 2 secondes.
          </li>
        </ol>

        <h4>2. Test d'Accessibilité (RGAA)</h4>
        <ol>
          <li>
            Utilise uniquement ton clavier (touche <strong>Tab</strong>).
          </li>
          <li>Navigue jusqu'au premier bouton.</li>
          <li>
            <strong>Vérification :</strong> Le bouton doit s'hydrater
            instantanément au focus. Le focus doit être conservé sur le bouton
            (tu devrais voir le contour de focus navigateur).
          </li>
          <li>
            Appuie sur <strong>Entrée</strong> : le compteur doit augmenter.
          </li>
          <li>
            Continue de "Tabber" : tu dois pouvoir traverser toute la liste
            normalement sans jamais perdre ton curseur de focus.
          </li>
        </ol>
      </div>
    </div>
  );
}
