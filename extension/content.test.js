import { openModal } from "./content";

global.fetch = jest.fn();

describe("Save button logic", () => {
  beforeEach(() => {
    document.body.innerHTML = ""; // Clear DOM before each test
    fetch.mockClear();
  });

  it("should send a POST request with the correct payload", async () => {
    fetch.mockResolvedValueOnce({ ok: true });

    openModal("Selected text");
    document.getElementById("flashcard-front").value = "Front text";
    document.getElementById("flashcard-hint").value = "Hint text";
    document.getElementById("flashcard-tags").value = "tag1, tag2";

    const form = document.querySelector("form");
    form.dispatchEvent(new Event("submit"));

    expect(fetch).toHaveBeenCalledWith("http://localhost:3001/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        front: "Front text",
        back: "Selected text",
        hint: "Hint text",
        tags: ["tag1", "tag2"],
      }),
    });
  });

  it("should display a success message on successful save", async () => {
    fetch.mockResolvedValueOnce({ ok: true });

    openModal("Selected text");
    document.getElementById("flashcard-front").value = "Front text";

    const form = document.querySelector("form");
    form.dispatchEvent(new Event("submit"));

    await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for async code

    const message = document.getElementById("flashcard-modal-message");
    expect(message.textContent).toBe("Card saved successfully!");
    expect(message.style.color).toBe("green");
  });

  it("should display an error message on failed save", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Error saving card." }),
    });

    openModal("Selected text");
    document.getElementById("flashcard-front").value = "Front text";

    const form = document.querySelector("form");
    form.dispatchEvent(new Event("submit"));

    await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for async code

    const message = document.getElementById("flashcard-modal-message");
    expect(message.textContent).toBe("Error saving card.");
    expect(message.style.color).toBe("red");
  });
});