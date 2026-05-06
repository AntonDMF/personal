import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/*

  SOSTITUISCI QUESTI 3 VALORI

*/

const SUPABASE_URL = "https://TUO-PROGETTO.supabase.co";

const SUPABASE_ANON_KEY = "TUA_ANON_KEY";

const EVENT_SLUG = "main-event";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById("rsvpForm");

const message = document.getElementById("formMessage");

const submitButton = document.getElementById("submitButton");

form.addEventListener("submit", async (event) => {

  event.preventDefault();

  message.textContent = "";

  message.className = "form-message";

  submitButton.disabled = true;

  submitButton.textContent = "Invio in corso...";

  const formData = new FormData(form);

  const payload = {

    event_slug: EVENT_SLUG,

    first_name: String(formData.get("first_name") || "").trim(),

    last_name_or_nickname: String(formData.get("last_name_or_nickname") || "").trim(),

    attendance_status: String(formData.get("attendance_status") || ""),

    guests_count: Number(formData.get("guests_count") || 0),

    needs_ncc_return: String(formData.get("needs_ncc_return") || "")

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

  if (!["yes", "no"].includes(payload.needs_ncc_return)) {

    showMessage("Seleziona se hai bisogno di NCC per il ritorno.", "error");

    resetButton();

    return;

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

  showMessage("Risposta registrata correttamente.", "success");

  resetButton();

});

function showMessage(text, type) {

  message.textContent = text;

  message.className = `form-message ${type}`;

}

function resetButton() {

  submitButton.disabled = false;

  submitButton.textContent = "Invia risposta";

}
