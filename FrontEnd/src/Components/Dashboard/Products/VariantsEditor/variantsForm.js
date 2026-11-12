// Form state for product variants.
//
//   options: [{ id, kind: "color" | "custom", name, values: [{ id, value, color_hex, image_url }] }]
//   skus:    [{ id, price, discount_price, stock, options: { [optionId]: valueId } }]
//
// An "option" is something the customer chooses (Color, Model, Size...).
// A "sku" is one sellable combination of values (Red + 45mm) with its own stock and price.
// The ids are only used inside the form, the API receives names instead (see toPayload).

export const COLOR_TYPE = "color";

let counter = 1;

const newId = (prefix) => `${prefix}-${counter++}`;

export const newValue = (kind) => ({
    id: newId("val"),
    value: "",
    color_hex: kind === "color" ? "#000000" : null,
    image_url: null,
});

export const newOption = (kind) => ({
    id: newId("opt"),
    kind,
    name: kind === "color" ? "Color" : "",
    values: [newValue(kind)],
});

export const newSku = (options = {}, template = {}) => ({
    id: newId("sku"),
    price: template.price ?? "",
    discount_price: template.discount_price ?? "",
    stock: "",
    options,
});

export const emptyVariantsState = () => ({
    options: [],
    skus: [newSku()],
});

const typeOf = (option) =>
    option.kind === "color" ? COLOR_TYPE : option.name.trim();

// ---------------------------------------------------------------------------
// API product  ->  form state
// ---------------------------------------------------------------------------

export const variantsFromProduct = (product) => {
    const optionByType = new Map();

    for (const variant of product.variants ?? []) {
        if (!optionByType.has(variant.type)) {
            const isColor = variant.type === COLOR_TYPE;

            optionByType.set(variant.type, {
                id: newId("opt"),
                kind: isColor ? "color" : "custom",
                name: isColor ? "Color" : variant.type,
                values: [],
            });
        }

        optionByType.get(variant.type).values.push({
            id: `val-db-${variant.id}`,
            value: variant.value,
            color_hex: variant.color_hex ?? "#000000",
            image_url: variant.image_url ?? null,
        });
    }

    const options = [...optionByType.values()];

    const skus = (product.skus ?? []).map((sku) => {
        const selection = {};

        for (const option of options) {
            const chosen = option.values.find(
                (item) => item.value === sku.options?.[typeOf(option)]
            );

            if (chosen) {
                selection[option.id] = chosen.id;
            }
        }

        return {
            id: sku.id,
            price: sku.price,
            discount_price: sku.discount_price ?? "",
            stock: sku.stock,
            options: selection,
        };
    });

    return {
        options,
        skus: skus.length > 0 ? skus : [newSku()],
    };
};

// ---------------------------------------------------------------------------
// form state  ->  API body ({ variants, skus })
// ---------------------------------------------------------------------------

export const variantsToPayload = ({ options, skus }) => ({
    variants: options.flatMap((option) =>
        option.values
            .filter((item) => item.value.trim())
            .map((item) => ({
                type: typeOf(option),
                value: item.value.trim(),
                color_hex: option.kind === "color" ? item.color_hex : null,
                image_url: item.image_url || null,
            }))
    ),

    skus: skus.map((sku) => ({
        id: typeof sku.id === "number" ? sku.id : undefined,
        price: Number(sku.price),
        discount_price:
            sku.discount_price === "" ? null : Number(sku.discount_price),
        stock: Number(sku.stock),
        options: Object.fromEntries(
            options.map((option) => {
                const chosen = option.values.find(
                    (item) => item.id === sku.options[option.id]
                );

                return [typeOf(option), chosen?.value.trim()];
            })
        ),
    })),
});

// ---------------------------------------------------------------------------
// Helpers used by the editor
// ---------------------------------------------------------------------------

const isWholeNumber = (value) =>
    value !== "" && Number.isInteger(Number(value)) && Number(value) >= 0;

const namedValues = (option) =>
    option.values.filter((item) => item.value.trim());

export const combinationKey = (options, sku) =>
    options.map((option) => sku.options[option.id] ?? "").join("|");

export const skuLabel = (options, sku) => {
    const parts = options
        .map((option) => {
            const chosen = option.values.find(
                (item) => item.id === sku.options[option.id]
            );

            return chosen?.value.trim();
        })
        .filter(Boolean);

    return parts.length > 0 ? parts.join(" · ") : "Default";
};

export const totalStock = (skus) =>
    skus.reduce((sum, sku) => sum + (Number(sku.stock) || 0), 0);

// Cheapest variant that is still in stock (cheapest overall if all are sold out)
export const startingPrice = (skus, isOnSale) => {
    const priced = skus.filter((sku) => isWholeNumber(sku.price));

    if (priced.length === 0) {
        return null;
    }

    const effective = (sku) =>
        isOnSale && isWholeNumber(sku.discount_price)
            ? Number(sku.discount_price)
            : Number(sku.price);

    const inStock = priced.filter((sku) => Number(sku.stock) > 0);
    const pool = inStock.length > 0 ? inStock : priced;

    return Math.min(...pool.map(effective));
};

// Every combination of the named values that has no row yet
export const missingCombinations = ({ options, skus }) => {
    const usable = options.filter((option) => namedValues(option).length > 0);

    if (usable.length === 0) {
        return [];
    }

    let combos = [{}];

    for (const option of usable) {
        combos = combos.flatMap((combo) =>
            namedValues(option).map((item) => ({
                ...combo,
                [option.id]: item.id,
            }))
        );
    }

    const existing = new Set(
        skus.map((sku) => combinationKey(usable, sku))
    );

    return combos.filter(
        (combo) => !existing.has(combinationKey(usable, { options: combo }))
    );
};

// Adds the missing rows. A completely empty row (nothing chosen yet) is used
// as the template for price and then replaced.
export const generateCombinations = (state) => {
    const missing = missingCombinations(state);

    if (missing.length === 0) {
        return state.skus;
    }

    const blankRows = state.skus.filter(
        (sku) => Object.keys(sku.options).length === 0
    );

    const template = blankRows[0] ?? state.skus[state.skus.length - 1] ?? {};

    const withSelection = state.skus.filter(
        (sku) => Object.keys(sku.options).length > 0
    );

    return [
        ...withSelection,
        ...missing.map((combo) => newSku(combo, template)),
    ];
};

// Rows that stop making sense when an option value disappears
export const skusUsingValue = (skus, optionId, valueId) =>
    skus.filter((sku) => sku.options[optionId] === valueId);

// ---------------------------------------------------------------------------
// Validation (the server checks again)
// ---------------------------------------------------------------------------

export const validateVariants = ({ options, skus }, { isOnSale }) => {
    const optionNames = new Set();

    for (const option of options) {
        const name = typeOf(option);

        if (!name) {
            return "Give every option a name (for example Model or Size).";
        }

        if (option.kind === "custom" && name.toLowerCase() === COLOR_TYPE) {
            return 'Use the "Color" option for colors.';
        }

        if (optionNames.has(name.toLowerCase())) {
            return `The option "${name}" is added twice.`;
        }

        optionNames.add(name.toLowerCase());

        const values = namedValues(option);

        if (values.length === 0) {
            return `Add at least one value to "${name}".`;
        }

        if (option.values.some((item) => !item.value.trim())) {
            return `Fill in or remove the empty value in "${name}".`;
        }

        const seen = new Set();

        for (const item of values) {
            const key = item.value.trim().toLowerCase();

            if (seen.has(key)) {
                return `"${item.value.trim()}" is listed twice in "${name}".`;
            }

            seen.add(key);
        }
    }

    if (skus.length === 0) {
        return "Add at least one variant with its stock and price.";
    }

    const seenCombinations = new Set();

    for (const sku of skus) {
        const label = skuLabel(options, sku);

        for (const option of options) {
            if (!sku.options[option.id]) {
                return `Choose a ${typeOf(option)} for every variant.`;
            }
        }

        const key = combinationKey(options, sku);

        if (seenCombinations.has(key)) {
            return `The variant "${label}" appears twice.`;
        }

        seenCombinations.add(key);

        if (!isWholeNumber(sku.stock)) {
            return `Enter the stock for "${label}" (0 or more).`;
        }

        if (!isWholeNumber(sku.price)) {
            return `Enter the price for "${label}".`;
        }

        if (isOnSale) {
            if (!isWholeNumber(sku.discount_price) || Number(sku.discount_price) <= 0) {
                return `The product is on sale: enter a sale price for "${label}".`;
            }

            if (Number(sku.discount_price) >= Number(sku.price)) {
                return `The sale price of "${label}" must be lower than its price.`;
            }
        }
    }

    return "";
};
