import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/*

  SOSTITUISCI QUESTI 3 VALORI

*/

const SUPABASE_URL = "https://xonkfaybccwruiavqxvr.supabase.co";

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvbmtmYXliY2N3cnVpYXZxeHZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwOTg2OTEsImV4cCI6MjA5MzY3NDY5MX0.I980bCbIBCBXeUUbLwJKyLKU_0sxRdCDwCl8Gw37Gew";

const EVENT_SLUG = "main-event";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById("rsvpForm");

const message = document.getElementById("formMessage");

const submitButton = document.getElementById("submitButton");

const nccDetails = document.getElementById("nccDetails");

const guestCountBox = document.getElementById("guestCountBox");

const nccRadios = document.querySelectorAll('input[name="needs_ncc_return"]');

const selfOnlyRadios = document.querySelectorAll('input[name="registering_self_only"]');

nccRadios.forEach((radio) => {

  radio.addEventListener("change", handleNccChange);

});

selfOnlyRadios.forEach((radio) => {

  radio.addEventListener("change", handleSelfOnlyChange);

});

form.addEventListener("submit", async (event) => {

  event.preventDefault();

  message.textContent = "";

  message.className = "form-message";

  submitButton.disabled = true;

  submitButton.textContent = "Invio in corso...";

  const formData = new FormData(form);

  const registeringSelfOnly = String(formData.get("registering_self_only") || "");

  const needsNccReturn = String(formData.get("needs_ncc_return") || "");

  const guestsCount =

    registeringSelfOnly === "yes"

      ? 1

      : Number(formData.get("guests_count") || 2);

  const payload = {

    event_slug: EVENT_SLUG,

    first_name: String(formData.get("first_name") || "").trim(),

    last_name_or_nickname: String(formData.get("last_name_or_nickname") || "").trim(),

    attendance_status: String(formData.get("attendance_status") || ""),

    registering_self_only: registeringSelfOnly,

    guests_count: guestsCount,

    food_requests: String(formData.get("food_requests") || "").trim() || null,

    needs_ncc_return: needsNccReturn,

    phone_country_code:

      needsNccReturn === "yes"

        ? String(formData.get("phone_country_code") || "").trim()

        : null,

    phone_number:

      needsNccReturn === "yes"

        ? String(formData.get("phone_number") || "").trim()

        : null,

    ncc_destination:

      needsNccReturn === "yes"

        ? String(formData.get("ncc_destination") || "").trim()

        : null

  };

  if (!payload.first_name || !payload.last_name_or_nickname) {

    showMessage("Inserisci nome e cognome/soprannome.", "error");

    resetButton();

    return;

  }

  if (!["yes", "no"].includes(payload.attendance_status)) {

    showMessage("Seleziona se partecipi o no.", "error");

    resetButton();

    return;

  }

  if (!["yes", "no"].includes(payload.registering_self_only)) {

    showMessage("Indica se stai registrando solo te stesso.", "error");

    resetButton();

    return;

  }

  if (payload.registering_self_only === "no" && payload.guests_count < 2) {

    showMessage("Inserisci il numero totale di persone.", "error");

    resetButton();

    return;

  }

  if (!["yes", "no"].includes(payload.needs_ncc_return)) {

    showMessage("Seleziona se hai bisogno di NCC per il ritorno.", "error");

    resetButton();

    return;

  }

  if (payload.needs_ncc_return === "yes") {

    if (!payload.ncc_destination) {

      showMessage("Inserisci la destinazione per il ritorno.", "error");

      resetButton();

      return;

    }

    if (!payload.phone_number) {

      showMessage("Inserisci un numero di telefono per essere ricontattato.", "error");

      resetButton();

      return;

    }

  }

  const { error } = await supabase

    .from("event_rsvps")

    .insert(payload);

  if (error) {

    console.error(error);

    showMessage("Errore durante l’invio. Riprova.", "error");

    resetButton();

    return;

  }

  form.reset();

  nccDetails.classList.add("hidden");

  guestCountBox.classList.add("hidden");

  showMessage("Risposta registrata correttamente.", "success");

  resetButton();

});

function handleNccChange() {

  const selected = document.querySelector('input[name="needs_ncc_return"]:checked');

  if (!selected) return;

  if (selected.value === "yes") {

    nccDetails.classList.remove("hidden");

  } else {

    nccDetails.classList.add("hidden");

  }

}

function handleSelfOnlyChange() {

  const selected = document.querySelector('input[name="registering_self_only"]:checked');

  if (!selected) return;

  if (selected.value === "no") {

    guestCountBox.classList.remove("hidden");

  } else {

    guestCountBox.classList.add("hidden");

  }

}

function showMessage(text, type) {

  message.textContent = text;

  message.className = `form-message ${type}`;

}

function resetButton() {

  submitButton.disabled = false;

  submitButton.textContent = "Invia risposta";

}
