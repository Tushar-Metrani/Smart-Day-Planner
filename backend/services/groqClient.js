const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const buildPrompt = ({ goals, freeSlots, categories, dateLabel }) => {
  const goalLines = goals.map((g) => {
    const pace = g.pace;
    let paceLine = "no deadline set";
    if (pace.status === "behind") paceLine = `BEHIND pace — averaging ${pace.avgPerDay.toFixed(1)}/day, needs ${pace.neededPerDay.toFixed(1)}/day`;
    else if (pace.status === "on_track") paceLine = `on track — averaging ${pace.avgPerDay.toFixed(1)}/day`;
    else if (pace.status === "overdue") paceLine = "deadline has passed";
    else if (pace.status === "due_today") paceLine = "due today";
    return `- id: ${g._id} | "${g.title}" | priority: ${g.priority} | progress: ${g.currentValue}/${g.targetValue} ${g.unit} | ${paceLine}`;
  }).join("\n");

  const slotLines = freeSlots.map((s) => `- ${s.startTime} to ${s.endTime}`).join("\n");

  return `You are scheduling assistant for a day planner app. Suggest schedule blocks for ${dateLabel} that help the user make progress on their pending goals.

PENDING GOALS:
${goalLines || "(none)"}

FREE TIME SLOTS TODAY (you may ONLY place suggestions fully inside these windows):
${slotLines || "(no free time available)"}

VALID CATEGORIES (use exactly one of these strings): ${categories.join(", ")}

RULES:
- Only suggest blocks linked to a goal from the list above — do not invent goals or suggest unlinked/general activities.
- Prioritize goals marked BEHIND pace, then high priority goals, then others.
- Each suggested block must fit entirely within one free slot (do not span across two slots or extend past a slot's end).
- Suggest reasonable session lengths (15 to 120 minutes) — do not fill an entire free slot if it's very long.
- Suggest at most 4 blocks total, and don't suggest more than one block for the same goal unless there are very few other goals.
- "progressAmount" should be a realistic amount of progress achievable in that block's duration (e.g. a 30-minute reading block might be 10-15 pages, not the entire remaining target).
- "reason" should be one short sentence explaining why this block/time was chosen.

Respond with ONLY a JSON object in this exact shape, no other text:
{"suggestions": [{"goalId": "...", "title": "...", "category": "...", "startTime": "HH:mm", "endTime": "HH:mm", "progressAmount": 0, "reason": "..."}]}`;
};

const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// Defensive validation — never trust the model's output blindly. A suggestion
// is only kept if it references a real goal, uses a real category, has
// well-formed times, and fits entirely inside one of the actual free slots.
const validateSuggestions = (raw, { goals, freeSlots, categories }) => {
  if (!raw || !Array.isArray(raw.suggestions)) return [];
  const goalIds = new Set(goals.map((g) => String(g._id)));
  const categorySet = new Set(categories);

  return raw.suggestions
    .filter((s) => s && typeof s.title === "string" && s.title.trim())
    .filter((s) => goalIds.has(String(s.goalId)))
    .map((s) => ({
      ...s,
      category: categorySet.has(s.category) ? s.category : "general",
    }))
    .filter((s) => /^\d{2}:\d{2}$/.test(s.startTime) && /^\d{2}:\d{2}$/.test(s.endTime))
    .filter((s) => toMinutes(s.endTime) > toMinutes(s.startTime))
    .filter((s) => {
      const start = toMinutes(s.startTime);
      const end = toMinutes(s.endTime);
      return freeSlots.some((slot) => start >= toMinutes(slot.startTime) && end <= toMinutes(slot.endTime));
    })
    .map((s) => ({
      goalId: s.goalId,
      title: s.title.trim(),
      category: s.category,
      startTime: s.startTime,
      endTime: s.endTime,
      progressAmount: Number(s.progressAmount) || 0,
      reason: typeof s.reason === "string" ? s.reason.trim() : "",
    }))
    .slice(0, 4);
};

export const getScheduleSuggestions = async ({ goals, freeSlots, categories, dateLabel }) => {
  if (!process.env.GROQ_API_KEY) {
    const err = new Error("GROQ_API_KEY is not configured on the server.");
    err.statusCode = 500;
    throw err;
  }
  if (goals.length === 0 || freeSlots.length === 0) return [];

  const prompt = buildPrompt({ goals, freeSlots, categories, dateLabel });

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    const err = new Error(`Groq API error (${response.status}): ${text}`);
    err.statusCode = 502;
    throw err;
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    return []; // model returned malformed JSON — fail safe with no suggestions rather than crashing
  }

  return validateSuggestions(parsed, { goals, freeSlots, categories });
};