const WORKER_URL = "https://prolyglot-worker.descx.workers.dev";

const inputTextarea = document.getElementById("inputText");
const languageOptionsDiv = document.getElementById("languageOptions");
const translateButton = document.getElementById("translateButton");
const translatedOutputDiv = document.getElementById("translatedText");

translateButton.addEventListener("click", async () => {
  const textToTranslate = inputTextarea.value;
  const selectedLanguage = languageOptionsDiv.querySelector(
    'input[name="language"]:checked'
  ).value;

  if (!textToTranslate) {
    translatedOutputDiv.textContent = "Please enter text to translate.";
    return;
  }

  if (!selectedLanguage) {
    translatedOutputDiv.textContent = "Please select a language.";
    return;
  }

  translatedOutputDiv.textContent = "Translating...";

  try {
    const response = await fetch(WORKER_URL, {
      method: "POST", // Method should be 'POST'
      headers: {
        "Content-Type": "application/json", // 'Content-Type' should be 'application/json'
      },
      // Challenge Step 1 (cont.): Set the body to an empty string for now
      // NOTE: For the worker to actually translate, the body should be JSON.stringify({ text: textToTranslate, language: selectedLanguage })
      body: JSON.stringify({
        text: textToTranslate,
        language: selectedLanguage,
      }), // <<< Changed to send JSON body
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${
          errorData.error || response.statusText
        }`
      );
    }

    // Challenge Step 2: Parse the response to a JavaScript object
    const data = await response.json();

    // Challenge Step 3: Log the response to the console
    console.log(data);

    // Update the output div with the translated text from the worker's response
    // NOTE: This assumes the worker returns { translatedText: "..." }
    if (data && data.translatedText) {
      translatedOutputDiv.textContent = data.translatedText;
    } else {
      translatedOutputDiv.textContent =
        "Translation failed: Invalid response from worker.";
      console.error("Invalid response data:", data);
    }
  } catch (error) {
    console.error("Error translating text:", error);
    translatedOutputDiv.textContent =
      "Error translating text. Please try again.";
  }
});
