"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import {
  computeNutrition,
  formatProductNutritionLabel,
  getByBarcode,
  inferDefaultPortion,
  mergeOFFProducts,
  searchFood,
  type OFFProduct,
} from "@/lib/openfoodfacts";
import { MEAL_LABELS, type Meal } from "@/lib/types";
import { addFood, type FoodState } from "./actions";
import { classNames } from "@/lib/utils";

const INPUT_CLS =
  "mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none";

type Mode = "unit" | "grams";

export function AddFoodPanel({ today, defaultMeal }: { today: string; defaultMeal: Meal }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OFFProduct[]>([]);
  const [selected, setSelected] = useState<OFFProduct | null>(null);
  const [enriching, setEnriching] = useState(false);
  const [mode, setMode] = useState<Mode>("grams");
  const [amount, setAmount] = useState(100);
  // Poids d'1 unité saisi par l'utilisateur (utilisé quand OFF ne le connaît pas)
  const [customUnitGrams, setCustomUnitGrams] = useState(75);
  const [meal, setMeal] = useState<Meal>(defaultMeal);
  const [portionEstimated, setPortionEstimated] = useState(false);
  const [referenceGrams, setReferenceGrams] = useState(100);
  const [searching, startSearch] = useTransition();
  const [state, formAction, pending] = useActionState<FoodState, FormData>(addFood, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      setSelected(null);
      setQuery("");
      setResults([]);
      setMode("grams");
      setAmount(100);
      setCustomUnitGrams(75);
      setPortionEstimated(false);
      setReferenceGrams(100);
      formRef.current?.reset();
    }
  }, [state]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      startSearch(async () => {
        const r = await searchFood(q);
        setResults(r);
      });
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  function applyDefaultPortion(p: OFFProduct) {
    const { grams, preferUnit, estimated } = inferDefaultPortion(p);
    setPortionEstimated(estimated);
    setReferenceGrams(grams);
    if (preferUnit) {
      setMode("unit");
      setAmount(1);
      if (!p.serving_quantity) setCustomUnitGrams(grams);
    } else {
      setMode("grams");
      setAmount(grams);
    }
  }

  const handleSelect = async (p: OFFProduct) => {
    applyDefaultPortion(p);
    setSelected(p);
    if (!p.code) return;

    setEnriching(true);
    try {
      const full = await getByBarcode(p.code);
      const merged = mergeOFFProducts(p, full);
      applyDefaultPortion(merged);
      setSelected(merged);
    } finally {
      setEnriching(false);
    }
  };

  const offServingQty = selected?.serving_quantity ?? null;
  const effectiveServingQty = offServingQty ?? customUnitGrams;
  const totalGrams =
    mode === "unit" && effectiveServingQty > 0
      ? Math.round(effectiveServingQty * amount)
      : Math.round(amount);

  const nutrition = selected
    ? computeNutrition(selected, totalGrams, referenceGrams)
    : { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  const { kcal, protein, carbs, fat } = nutrition;

  if (selected) {
    return (
      <form ref={formRef} action={formAction} className="space-y-3">
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="text-sm text-muted hover:underline"
        >
          ← retour à la recherche
        </button>
        <div>
          <h3 className="text-base font-semibold">{selected.name}</h3>
          <p className="text-xs text-muted">
            {selected.brand ?? "Sans marque"}
            {selected.quantity_text ? ` · ${selected.quantity_text}` : ""}
          </p>
          {enriching && <p className="text-xs text-muted">Chargement des détails…</p>}
        </div>

        <div className="inline-flex rounded-full border border-border bg-zinc-50 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode("unit");
              setAmount(1);
            }}
            className={classNames(
              "rounded-full px-3 py-1 font-medium transition",
              mode === "unit" ? "bg-primary text-white" : "text-muted",
            )}
          >
            Unités
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("grams");
              setAmount(Math.round(referenceGrams));
            }}
            className={classNames(
              "rounded-full px-3 py-1 font-medium transition",
              mode === "grams" ? "bg-primary text-white" : "text-muted",
            )}
          >
            Grammes
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-medium">
              {mode === "unit" ? "Nombre d'unités" : "Portion (g)"}
            </span>
            <input
              type="number"
              min={mode === "unit" ? "0.25" : "1"}
              step={mode === "unit" ? "0.25" : "1"}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              className={INPUT_CLS}
            />
            {mode === "unit" && offServingQty && (
              <span className="text-xs text-muted">
                1 unité = {offServingQty} g
                {selected.serving_size ? ` (${selected.serving_size})` : ""}
              </span>
            )}
            {portionEstimated && (
              <span className="text-xs text-muted">
                {mode === "unit"
                  ? `Portion moyenne estimée : ~${customUnitGrams} g`
                  : `Portion moyenne estimée : ~${amount} g`}
              </span>
            )}
          </label>
          <label className="block">
            <span className="text-sm font-medium">Repas</span>
            <select
              name="meal"
              value={meal}
              onChange={(e) => setMeal(e.target.value as Meal)}
              className={INPUT_CLS}
            >
              {(Object.keys(MEAL_LABELS) as Meal[]).map((m) => (
                <option key={m} value={m}>
                  {MEAL_LABELS[m]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {mode === "unit" && !offServingQty && (
          <label className="block rounded-lg border border-amber-200 bg-amber-50 p-3">
            <span className="text-sm font-medium">Poids d'1 unité (g)</span>
            <span className="ml-2 text-xs text-muted">
              OpenFoodFacts ne le sait pas pour ce produit — indique-le à la main.
            </span>
            <input
              type="number"
              min="1"
              step="1"
              value={customUnitGrams}
              onChange={(e) => {
                const g = Number(e.target.value) || 0;
                setCustomUnitGrams(g);
                setReferenceGrams(g);
              }}
              className={INPUT_CLS}
            />
            <span className="text-xs text-muted">
              Ex: ~75 g pour un Magnum classic, ~120 g pour une banane moyenne, ~125 g pour un yaourt.
            </span>
          </label>
        )}

        <div className="rounded-xl bg-zinc-50 p-3 text-sm">
          <div className="flex justify-between">
            <span>
              Calories
              {mode === "unit" && (
                <span className="ml-1 text-xs text-muted">({totalGrams} g au total)</span>
              )}
            </span>
            <strong>{kcal} kcal</strong>
          </div>
          <div className="mt-1 flex justify-between text-xs text-muted">
            <span>P {protein} g</span>
            <span>G {carbs} g</span>
            <span>L {fat} g</span>
          </div>
        </div>

        <input type="hidden" name="name" value={selected.name} />
        <input type="hidden" name="brand" value={selected.brand ?? ""} />
        <input type="hidden" name="barcode" value={selected.code ?? ""} />
        <input type="hidden" name="serving_g" value={totalGrams} />
        <input type="hidden" name="kcal" value={kcal} />
        <input type="hidden" name="protein_g" value={protein} />
        <input type="hidden" name="carbs_g" value={carbs} />
        <input type="hidden" name="fat_g" value={fat} />
        <input type="hidden" name="logged_at" value={today} />

        {state?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending || kcal === 0}
          className="w-full rounded-full bg-primary py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Ajout..." : "Ajouter au journal"}
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un aliment (banane, riz, yaourt…)"
          className={INPUT_CLS}
        />
      </div>
      <details className="rounded-lg border border-border bg-zinc-50 p-3">
        <summary className="cursor-pointer text-sm font-medium">
          Aliment introuvable ? Saisir manuellement
        </summary>
        <ManualFoodForm today={today} defaultMeal={defaultMeal} />
      </details>

      {searching && <p className="text-sm text-muted">Recherche…</p>}
      <ul className="divide-y divide-border rounded-xl border border-border bg-card">
        {results.map((p) => (
          <li key={p.code}>
            <button
              type="button"
              onClick={() => handleSelect(p)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50"
            >
              {p.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.image_url}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded object-cover"
                />
              ) : (
                <div className="h-10 w-10 shrink-0 rounded bg-zinc-100" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="truncate text-xs text-muted">
                  {p.brand ?? "Sans marque"} ·{" "}
                  {formatProductNutritionLabel(p)}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ManualFoodForm({ today, defaultMeal }: { today: string; defaultMeal: Meal }) {
  const [state, formAction, pending] = useActionState<FoodState, FormData>(addFood, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="mt-3 space-y-3">
      <label className="block">
        <span className="text-sm font-medium">Nom</span>
        <input name="name" type="text" required maxLength={120} className={INPUT_CLS} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm font-medium">Calories</span>
          <input name="kcal" type="number" min="0" step="1" required className={INPUT_CLS} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Repas</span>
          <select name="meal" defaultValue={defaultMeal} className={INPUT_CLS}>
            {(Object.keys(MEAL_LABELS) as Meal[]).map((m) => (
              <option key={m} value={m}>
                {MEAL_LABELS[m]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <input type="hidden" name="logged_at" value={today} />
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Ajout..." : "Ajouter"}
      </button>
    </form>
  );
}
