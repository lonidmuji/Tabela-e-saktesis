import React, { useState, useMemo } from "react";

// =====================================================
// ICONS - PA LUCIDE-REACT
// =====================================================

const Calculator = () => <span>🧮</span>;
const XCircle = () => <span>❌</span>;
const HelpCircle = () => <span>❓</span>;
const BookOpen = () => <span>📘</span>;
const RotateCcw = () => <span>🔄</span>;
const Layers = () => <span>🧩</span>;
const Sliders = () => <span>⚙️</span>;
const Copy = () => <span>📋</span>;
const Check = () => <span>✔️</span>;

// =====================================================
// SIMBOLET
// =====================================================

const SYMBOLS = [
  { label: "∩", name: "Prerja (AND)", code: "∩" },
  { label: "∪", name: "Bashkimi (OR)", code: "∪" },
  { label: "∖", name: "Diferenca", code: "∖" },
  { label: "△", name: "Diferenca Simetrike", code: "△" },
  { label: "'", name: "Plotësi (NOT)", code: "'" },
  { label: "∅", name: "Bashkësia Bosh", code: "∅" },
  { label: "U", name: "Universi", code: "U" },
  { label: "=", name: "Barazimi", code: "=" },
  { label: "(", name: "Kllapë majtas", code: "(" },
  { label: ")", name: "Kllapë djathtas", code: ")" },
  { label: "A", name: "Bashkësia A", code: "A" },
  { label: "B", name: "Bashkësia B", code: "B" },
  { label: "C", name: "Bashkësia C", code: "C" },
];

// =====================================================
// LIGJET
// =====================================================

const PRESETS = [
  {
    title: "1a. Ligji i Idempotencës",
    formula: "A ∪ A = A",
  },
  {
    title: "1b. Ligji i Idempotencës",
    formula: "A ∩ A = A",
  },
  {
    title: "2a. Ligji Asociativ",
    formula: "(A ∪ B) ∪ C = A ∪ (B ∪ C)",
  },
  {
    title: "2b. Ligji Asociativ",
    formula: "(A ∩ B) ∩ C = A ∩ (B ∩ C)",
  },
  {
    title: "3a. Ligji Komutativ",
    formula: "A ∪ B = B ∪ A",
  },
  {
    title: "3b. Ligji Komutativ",
    formula: "A ∩ B = B ∩ A",
  },
  {
    title: "4a. Ligji Distributiv",
    formula: "A ∪ (B ∩ C) = (A ∪ B) ∩ (A ∪ C)",
  },
  {
    title: "4b. Ligji Distributiv",
    formula: "A ∩ (B ∪ C) = (A ∩ B) ∪ (A ∩ C)",
  },
  {
    title: "5a. Ligji i Identitetit",
    formula: "A ∪ ∅ = A",
  },
  {
    title: "5b. Ligji i Identitetit",
    formula: "A ∩ U = A",
  },
  {
    title: "6a. Ligji i Identitetit",
    formula: "A ∪ U = U",
  },
  {
    title: "6b. Ligji i Identitetit",
    formula: "A ∩ ∅ = ∅",
  },
  {
    title: "7a. Ligji i Involucionit",
    formula: "(A')' = A",
  },
  {
    title: "8a. Ligji i Komplementit",
    formula: "A ∪ A' = U",
  },
  {
    title: "8b. Ligji i Komplementit",
    formula: "A ∩ A' = ∅",
  },
  {
    title: "9a. Ligji i Komplementit",
    formula: "U' = ∅",
  },
  {
    title: "9b. Ligji i Komplementit",
    formula: "∅' = U",
  },
  {
    title: "10a. Ligji i DeMorganit",
    formula: "(A ∪ B)' = A' ∩ B'",
  },
  {
    title: "10b. Ligji i DeMorganit",
    formula: "(A ∩ B)' = A' ∪ B'",
  },
];

// =====================================================
// PARSER
// =====================================================

const parseExpression = (expr) => {
  if (!expr) {
    return "false";
  }

  let clean = expr;
  let previous;

  do {
    previous = clean;

    clean = clean.replace(/\(([^()]+)\)'/g, "!($1)");
    clean = clean.replace(/([A-Z]|∅)'/g, "!$1");
  } while (clean !== previous);

  clean = clean
    .replace(/∅/g, " false ")
    .replace(/\bU\b/g, " true ")
    .replace(/∩/g, " && ")
    .replace(/∪/g, " || ")
    .replace(/∖/g, " && !")
    .replace(/△/g, " !== ")
    .replace(/→/g, " <= ")
    .replace(/↔/g, " === ");

  return clean;
};

// =====================================================
// SUB EXPRESSIONS
// =====================================================

const extractSubExpressions = (expr) => {
  const steps = [];
  const regex = /\(([^()]+)\)/g;

  let match;

  while ((match = regex.exec(expr)) !== null) {
    const sub = match[1].trim();

    if (
      sub &&
      !steps.includes(sub) &&
      sub.length > 1
    ) {
      steps.push(sub);
    }
  }

  return steps;
};

// =====================================================
// APP
// =====================================================

export default function App() {
  const [inputFormula, setInputFormula] = useState(
    "8a. A ∪ A' = U"
  );

  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // ===================================================
  // FORMULA E PASTRUAR
  // ===================================================

  const cleanFormula = useMemo(() => {
    return inputFormula.replace(/^\d+[a-b]?\.\s*/, "");
  }, [inputFormula]);

  // ===================================================
  // VARIABLES
  // ===================================================

  const variables = useMemo(() => {
    const found = cleanFormula.match(/[A-Z]/g) || [];

    const filtered = Array.from(new Set(found))
      .filter((value) => value !== "U")
      .sort();

    return filtered.length > 0
      ? filtered
      : ["A"];
  }, [cleanFormula]);

  // ===================================================
  // EVALUATE
  // ===================================================

  function evaluateInContext(parsedExpr, context) {
    try {
      const keys = Object.keys(context);
      const values = Object.values(context);

      const fn = new Function(
        ...keys,
        `return Boolean(${parsedExpr});`
      );

      return fn(...values);
    } catch {
      return false;
    }
  }

  // ===================================================
  // TABELA
  // ===================================================

  const tableData = useMemo(() => {
    setError(null);

    if (!cleanFormula.trim()) {
      return null;
    }

    try {
      const isEquation = cleanFormula.includes("=");

      let lhsStr = cleanFormula;
      let rhsStr = null;

      if (isEquation) {
        const parts = cleanFormula.split("=");

        if (parts.length > 2) {
          throw new Error(
            "Formula duhet të ketë vetëm një shenjë barazimi '='."
          );
        }

        lhsStr = parts[0].trim();
        rhsStr = parts[1].trim();
      }

      if (variables.length > 4) {
        throw new Error(
          "Maximumi i lejuar është 4 bashkësi."
        );
      }

      const parsedLhs = parseExpression(lhsStr);

      const parsedRhs =
        rhsStr !== null
          ? parseExpression(rhsStr)
          : null;

      const lhsSub = extractSubExpressions(lhsStr);

      const rhsSub =
        rhsStr !== null
          ? extractSubExpressions(rhsStr)
          : [];

      const rowsCount = Math.pow(
        2,
        variables.length
      );

      const rows = [];

      let allTrue = true;
      let isIdentityValid = true;

      for (
        let i = 0;
        i < rowsCount;
        i++
      ) {
        const rowVars = {};

        variables.forEach((variable, index) => {
          const shift =
            variables.length - 1 - index;

          rowVars[variable] = Boolean(
            !((i >> shift) & 1)
          );
        });

        const lhsSubResults =
          lhsSub.map((sub) => {
            try {
              return evaluateInContext(
                parseExpression(sub),
                rowVars
              )
                ? 1
                : 0;
            } catch {
              return 0;
            }
          });

        const rhsSubResults =
          rhsSub.map((sub) => {
            try {
              return evaluateInContext(
                parseExpression(sub),
                rowVars
              )
                ? 1
                : 0;
            } catch {
              return 0;
            }
          });

        const lhsVal = evaluateInContext(
          parsedLhs,
          rowVars
        );

        const rhsVal =
          parsedRhs !== null
            ? evaluateInContext(
                parsedRhs,
                rowVars
              )
            : null;

        if (!lhsVal) {
          allTrue = false;
        }

        if (
          rhsVal !== null &&
          lhsVal !== rhsVal
        ) {
          isIdentityValid = false;
        }

        rows.push({
          vars: rowVars,
          lhsSubResults,
          lhsVal: lhsVal ? 1 : 0,
          rhsSubResults,
          rhsVal:
            rhsVal !== null
              ? rhsVal
                ? 1
                : 0
              : null,
          match:
            rhsVal !== null
              ? lhsVal === rhsVal
              : null,
        });
      }

      return {
        isEquation,
        lhsStr,
        rhsStr,
        lhsSub,
        rhsSub,
        rows,
        allTrue,
        isIdentityValid,
      };
    } catch (err) {
      setError(
        err.message ||
          "Sintaksë e pasaktë e formulës."
      );

      return null;
    }
  }, [cleanFormula, variables]);

  // ===================================================
  // INSERT SYMBOL
  // ===================================================

  const insertSymbol = (symbol) => {
    setInputFormula(
      (previous) => previous + symbol
    );
  };

  // ===================================================
  // COPY
  // ===================================================

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        cleanFormula
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError(
        "Nuk u kopjua formula."
      );
    }
  };

  // ===================================================
  // BADGES
  // ===================================================

  const renderBadge = (value) => {
    if (
      value === 1 ||
      value === true
    ) {
      return (
        <span className="custom-badge badge-element">
          ∈ Element
        </span>
      );
    }

    return (
      <span className="custom-badge badge-non-element">
        ∉ Jo Element
      </span>
    );
  };

  // ===================================================
  // JSX
  // ===================================================

  return (
    <div className="page-wrapper">

      <style>{`

        /* =============================================
           RESET
        ============================================= */

        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100%;
        }

        body {
          background: #eef2f7;
          color: #111827;
        }

        button,
        input,
        select {
          font-family: inherit;
        }

        /* =============================================
           PAGE
        ============================================= */

        .page-wrapper {
          width: 100%;
          min-height: 100vh;
          background:
            linear-gradient(
              135deg,
              #eef2ff 0%,
              #f8fafc 50%,
              #e5e7eb 100%
            );
          color: #111827;
          display: flex;
          flex-direction: column;
        }

        /* =============================================
           HEADER
        ============================================= */

        .app-header {
          width: 100%;
          background:
            linear-gradient(
              135deg,
              #4338ca,
              #3730a3
            );
          color: white;
          box-shadow:
            0 4px 15px
            rgba(15, 23, 42, 0.18);
        }

        .header-content {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          padding:
            1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .header-title {
          color: white;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .guide-button {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding:
            0.65rem 1rem;
          background: #4f46e5;
          color: white;
          border: 1px solid
            rgba(255,255,255,0.2);
          border-radius: 0.6rem;
          cursor: pointer;
          font-weight: 800;
          transition: 0.2s;
        }

        .guide-button:hover {
          background: #6366f1;
          transform: translateY(-1px);
        }

        /* =============================================
           MAIN
        ============================================= */

        .main-container {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          flex: 1;
        }

        /* =============================================
           CARDS
        ============================================= */

        .card-box {
          width: 100%;
          background: #ffffff;
          border:
            1px solid #cbd5e1;
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow:
            0 4px 16px
            rgba(15, 23, 42, 0.06);
        }

        /* =============================================
           GUIDE
        ============================================= */

        .guide-card {
          background:
            linear-gradient(
              135deg,
              #eef2ff,
              #f5f3ff
            );
          border-color: #c7d2fe;
        }

        .guide-title {
          margin: 0;
          color: #312e81;
          font-weight: 900;
        }

        .guide-text {
          color: #1f2937;
          font-weight: 500;
          line-height: 1.7;
        }

        /* =============================================
           INPUT HEADER
        ============================================= */

        .input-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding-bottom: 1rem;
          border-bottom:
            1px solid #e5e7eb;
        }

        .input-title {
          color: #111827;
          font-weight: 900;
          font-size: 1rem;
        }

        /* =============================================
           SELECT
        ============================================= */

        .preset-select {
          min-width: 320px;
          padding:
            0.65rem 0.8rem;
          background: #ffffff;
          color: #111827;
          border:
            1px solid #9ca3af;
          border-radius: 0.6rem;
          font-weight: 700;
          cursor: pointer;
          outline: none;
        }

        .preset-select:hover {
          border-color: #4f46e5;
        }

        .preset-select:focus {
          border-color: #4f46e5;
          box-shadow:
            0 0 0 3px
            rgba(79,70,229,0.12);
        }

        .preset-select option {
          background: white;
          color: #111827;
          font-weight: 600;
        }

        /* =============================================
           FORMULA INPUT
        ============================================= */

        .formula-input-wrapper {
          position: relative;
          width: 100%;
          margin-top: 1rem;
        }

        .formula-input {
          width: 100%;
          height: 60px;
          padding:
            0.75rem 6rem 0.75rem 1.1rem;
          background: #ffffff;
          color: #111827;
          border:
            2px solid #cbd5e1;
          border-radius: 0.75rem;
          font-family: monospace;
          font-size: 1.2rem;
          font-weight: 800;
          outline: none;
        }

        .formula-input::placeholder {
          color: #6b7280;
          opacity: 1;
        }

        .formula-input:focus {
          border-color: #4f46e5;
          box-shadow:
            0 0 0 4px
            rgba(79,70,229,0.12);
        }

        /* =============================================
           COPY / RESET
        ============================================= */

        .input-actions {
          position: absolute;
          right: 0.55rem;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          gap: 0.35rem;
        }

        .icon-btn {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
          color: #111827;
          border:
            1px solid #cbd5e1;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 1rem;
        }

        .icon-btn:hover {
          background: #e0e7ff;
          border-color: #6366f1;
        }

        /* =============================================
           SYMBOLS
        ============================================= */

        .symbols-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .symbol-btn {
          min-width: 42px;
          height: 40px;
          padding:
            0.3rem 0.7rem;
          background: #f8fafc;
          color: #111827;
          border:
            1px solid #cbd5e1;
          border-radius: 0.55rem;
          font-family: monospace;
          font-size: 1rem;
          font-weight: 900;
          cursor: pointer;
          transition: 0.2s;
        }

        .symbol-btn:hover {
          background: #4f46e5;
          color: white;
          border-color: #4f46e5;
          transform: translateY(-2px);
        }

        /* =============================================
           ERROR
        ============================================= */

        .error-box {
          margin-top: 1rem;
          padding:
            0.8rem 1rem;
          background: #fef2f2;
          color: #991b1b;
          border:
            1px solid #fecaca;
          border-radius: 0.6rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
        }

        /* =============================================
           TABLE
        ============================================= */

        .table-card {
          width: 100%;
          background: white;
          border:
            1px solid #cbd5e1;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow:
            0 5px 20px
            rgba(15,23,42,0.07);
        }

        .table-header {
          padding:
            1.1rem 1.5rem;
          background: #f8fafc;
          border-bottom:
            1px solid #dbe2ea;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .table-title {
          margin: 0;
          color: #111827;
          font-size: 1rem;
          font-weight: 900;
        }

        .verified {
          padding:
            0.45rem 0.8rem;
          color: #166534;
          background: #dcfce7;
          border:
            1px solid #4ade80;
          border-radius: 0.5rem;
          font-weight: 900;
        }

        .not-verified {
          padding:
            0.45rem 0.8rem;
          color: #991b1b;
          background: #fee2e2;
          border:
            1px solid #f87171;
          border-radius: 0.5rem;
          font-weight: 900;
        }

        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }

        .truth-table {
          width: 100%;
          border-collapse: collapse;
          text-align: center;
          font-family: monospace;
          font-size: 0.9rem;
        }

        .truth-table th,
        .truth-table td {
          padding:
            0.9rem 1rem;
          border-bottom:
            1px solid #dbe2ea;
          border-right:
            1px solid #dbe2ea;
          color: #111827;
          font-weight: 800;
        }

        .truth-table th {
          background: #eef2f7;
          color: #111827;
          font-weight: 900;
        }

        .truth-table tbody tr:hover {
          background: #f8fafc;
        }

        /* =============================================
           BADGES
        ============================================= */

        .custom-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding:
            0.4rem 0.75rem;
          border-radius: 0.45rem;
          font-family: monospace;
          font-size: 0.78rem;
          font-weight: 900;
          white-space: nowrap;
        }

        .badge-element {
          background: #dcfce7;
          color: #166534;
          border:
            1px solid #4ade80;
        }

        .badge-non-element {
          background: #fee2e2;
          color: #991b1b;
          border:
            1px solid #f87171;
        }

        /* =============================================
           RESPONSIVE
        ============================================= */

        @media (max-width: 800px) {

          .header-content {
            padding: 1rem;
          }

          .main-container {
            padding: 1rem;
          }

          .input-header-row {
            flex-direction: column;
            align-items: stretch;
          }

          .preset-select {
            width: 100%;
            min-width: 100%;
          }

          .table-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-title {
            font-size: 1rem !important;
          }
        }

      `}</style>

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="app-header">
        <div className="header-content">

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <Calculator />

            <h1
              className="header-title"
              style={{
                margin: 0,
                fontSize: "1.35rem",
              }}
            >
              Gjeneruesi i Tabelës së Vërtetësisë
            </h1>
          </div>

          <button
            className="guide-button"
            type="button"
            onClick={() =>
              setShowGuide(!showGuide)
            }
          >
            <HelpCircle />
            Udhëzuesi
          </button>

        </div>
      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="main-container">

        {/* GUIDE */}

        {showGuide && (
          <div className="card-box guide-card">

            <h3 className="guide-title">
              <BookOpen /> Udhëzues
            </h3>

            <p className="guide-text">
              <strong>A ∩ B</strong> = Prerja
              {" | "}
              <strong>A ∪ B</strong> = Bashkimi
              {" | "}
              <strong>A'</strong> = Plotësi
              {" | "}
              <strong>∅</strong> = Bosh
              {" | "}
              <strong>U</strong> = Universi
            </p>

          </div>
        )}

        {/* =================================================
            FORMULA
        ================================================= */}

        <div className="card-box">

          <div className="input-header-row">

            <span className="input-title">
              <Sliders /> Ligjet e Bashkësive:
            </span>

            <select
              className="preset-select"
              value={inputFormula}
              onChange={(event) => {
                if (event.target.value) {
                  setInputFormula(
                    event.target.value
                  );
                }
              }}
            >

              <option
                value=""
                disabled
              >
                -- Zgjidh Ligj --
              </option>

              {PRESETS.map(
                (preset, index) => (
                  <option
                    key={index}
                    value={`${preset.title.split(".")[0]}. ${preset.formula}`}
                  >
                    {preset.title}:{" "}
                    {preset.formula}
                  </option>
                )
              )}

            </select>

          </div>

          {/* INPUT */}

          <div className="formula-input-wrapper">

            <input
              className="formula-input"
              type="text"
              value={cleanFormula}
              onChange={(event) =>
                setInputFormula(
                  event.target.value
                )
              }
              placeholder="A ∪ A' = U"
            />

            <div className="input-actions">

              <button
                className="icon-btn"
                type="button"
                onClick={handleCopy}
                title="Kopjo formulën"
              >
                {copied ? (
                  <Check />
                ) : (
                  <Copy />
                )}
              </button>

              <button
                className="icon-btn"
                type="button"
                onClick={() =>
                  setInputFormula("")
                }
                title="Pastro formulën"
              >
                <RotateCcw />
              </button>

            </div>

          </div>

          {/* SYMBOL BUTTONS */}

          <div className="symbols-bar">

            {SYMBOLS.map(
              (symbol, index) => (
                <button
                  key={index}
                  className="symbol-btn"
                  type="button"
                  title={symbol.name}
                  onClick={() =>
                    insertSymbol(
                      symbol.code
                    )
                  }
                >
                  {symbol.label}
                </button>
              )
            )}

          </div>

          {/* ERROR */}

          {error && (
            <div className="error-box">
              <XCircle />
              <span>{error}</span>
            </div>
          )}

        </div>

        {/* =================================================
            TRUTH TABLE
        ================================================= */}

        {tableData && !error && (
          <div className="table-card">

            <div className="table-header">

              <h3 className="table-title">
                <Layers /> Tabela e Vërtetësisë
              </h3>

              <span
                className={
                  tableData.isIdentityValid
                    ? "verified"
                    : "not-verified"
                }
              >
                {tableData.isEquation
                  ? tableData.isIdentityValid
                    ? "☑ E Vërtetuar"
                    : "☒ Jo Barazi"
                  : "Shprehje"}
              </span>

            </div>

            <div className="table-responsive">

              <table className="truth-table">

                <thead>
                  <tr>

                    {variables.map(
                      (variable) => (
                        <th key={variable}>
                          {variable}
                        </th>
                      )
                    )}

                    {tableData.lhsSub.map(
                      (sub, index) => (
                        <th
                          key={`lhs-sub-${index}`}
                          style={{
                            backgroundColor:
                              "#e0e7ff",
                            color: "#111827",
                          }}
                        >
                          ({sub})
                        </th>
                      )
                    )}

                    <th
                      style={{
                        backgroundColor:
                          "#c7d2fe",
                        color: "#111827",
                      }}
                    >
                      {tableData.lhsStr}
                    </th>

                    {tableData.rhsSub.map(
                      (sub, index) => (
                        <th
                          key={`rhs-sub-${index}`}
                          style={{
                            backgroundColor:
                              "#f3e8ff",
                            color: "#111827",
                          }}
                        >
                          ({sub})
                        </th>
                      )
                    )}

                    {tableData.isEquation && (
                      <th
                        style={{
                          backgroundColor:
                            "#e9d5ff",
                          color: "#111827",
                        }}
                      >
                        {tableData.rhsStr}
                      </th>
                    )}

                    {tableData.isEquation && (
                      <th>
                        F
                      </th>
                    )}

                  </tr>
                </thead>

                <tbody>

                  {tableData.rows.map(
                    (row, rowIndex) => (
                      <tr key={rowIndex}>

                        {variables.map(
                          (variable) => (
                            <td key={variable}>
                              {renderBadge(
                                row.vars[
                                  variable
                                ]
                              )}
                            </td>
                          )
                        )}

                        {row.lhsSubResults.map(
                          (value, index) => (
                            <td
                              key={`lhs-sub-res-${index}`}
                            >
                              {renderBadge(
                                value
                              )}
                            </td>
                          )
                        )}

                        <td>
                          {renderBadge(
                            row.lhsVal
                          )}
                        </td>

                        {row.rhsSubResults.map(
                          (value, index) => (
                            <td
                              key={`rhs-sub-res-${index}`}
                            >
                              {renderBadge(
                                value
                              )}
                            </td>
                          )
                        )}

                        {tableData.isEquation && (
                          <td>
                            {renderBadge(
                              row.rhsVal
                            )}
                          </td>
                        )}

                        {tableData.isEquation && (
                          <td
                            style={{
                              color: row.match
                                ? "#166534"
                                : "#991b1b",
                              fontWeight: 900,
                              fontSize: "1rem",
                            }}
                          >
                            {row.match
                              ? "Po"
                              : "Jo"}
                          </td>
                        )}

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>
        )}

      </main>
      <footer>
        POWERED BY ORTO WEB LONID MUJI
      </footer>
    </div>
  );
}