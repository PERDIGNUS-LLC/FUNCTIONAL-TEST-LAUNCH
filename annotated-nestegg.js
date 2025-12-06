// annotated-nestegg.js
document.addEventListener("DOMContentLoaded", () => {
  const viewer = document.getElementById("nesteggViewer");
  const layout = document.getElementById("ne-layout");
  const hotspots = Array.from(
    document.querySelectorAll("model-viewer .ne-hotspot")
  );

  const detailTitle = document.getElementById("detail-title");
  const detailBody = document.getElementById("detail-body");
  const resetBtn = document.getElementById("resetViewBtn");

  if (!viewer) return;

  // Capture baseline camera state so we can always go “home”.
  const defaultOrbit =
    viewer.getAttribute("camera-orbit") || "20deg 80deg 1.6m";
  const defaultFov =
    viewer.getAttribute("field-of-view") || "35deg";

  function setCamera(orbit, fov) {
    if (orbit) viewer.setAttribute("camera-orbit", orbit);
    if (fov) viewer.setAttribute("field-of-view", fov);
  }

  function clearActive() {
    hotspots.forEach(h => h.classList.remove("active"));
  }

  function resetView() {
    clearActive();
    setCamera(defaultOrbit, defaultFov);
    viewer.setAttribute("auto-rotate", "true");
    layout.classList.remove("ne-zoomed");
    detailTitle.textContent = "Explore the NestEgg";
    detailBody.textContent =
      "Tap any glowing orb on the NestEgg to zoom in on that feature. " +
      "The camera will reframe around the selected detail while this panel " +
      "explains how it contributes to microclimate stability, safety, and " +
      "field usability.";
  }

  hotspots.forEach(hotspot => {
    hotspot.addEventListener("click", () => {
      const isActive = hotspot.classList.contains("active");

      // Clicking an already-active hotspot = reset.
      if (isActive) {
        resetView();
        return;
      }

      clearActive();
      hotspot.classList.add("active");
      layout.classList.add("ne-zoomed");

      // Freeze auto rotate while zoomed.
      viewer.removeAttribute("auto-rotate");

      const orbit = hotspot.dataset.orbit;
      const fov = hotspot.dataset.fov;
      const title = hotspot.dataset.title || "NestEgg Feature";
      const body =
        hotspot.dataset.body ||
        "This feature participates in the NestEgg’s microclimate, safety, or field deployment behavior.";

      setCamera(orbit, fov);
      detailTitle.textContent = title;
      detailBody.textContent = body;
    });
  });

  resetBtn?.addEventListener("click", resetView);
});
