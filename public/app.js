document
  .getElementById("urlForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const urlInput = document.getElementById("url");
    const slugInput = document.getElementById("slug");
    const errorDiv = document.getElementById("error");
    const shortUrlLink = document.getElementById("shortUrl");

    // Clear previous error and short URL
    errorDiv.textContent = "";
    shortUrlLink.textContent = "";

    const url = urlInput.value.trim();
    const slug = slugInput.value.trim();

    if (url === "") {
      errorDiv.textContent = "Please enter a URL";
      return;
    }

    try {
      const response = await fetch("/url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          slug: slug || undefined,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const shortUrl = window.location.href + result.slug;
        shortUrlLink.href = shortUrl;
        shortUrlLink.textContent = shortUrl;
      } else if (response.status === 429) {
        errorDiv.textContent =
          "You are sending too many requests. Try again in 30 seconds.";
      } else {
        const result = await response.json();
        errorDiv.textContent = result.message;
      }
    } catch (error) {
      errorDiv.textContent = "An error occurred while creating the short URL.";
    }
  });
