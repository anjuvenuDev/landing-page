async (page) => {
  const sectionIds = [
    "about",
    "projects",
    "work",
    "tech",
    "soft",
    "activities",
    "hobbies",
    "achievements",
  ];

  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("http://127.0.0.1:5174", { waitUntil: "networkidle" });
  await page.evaluate((ids) => {
    localStorage.setItem("anjana-memory-unlocks", JSON.stringify(ids));
  }, sectionIds);
  await page.reload({ waitUntil: "networkidle" });

  const skipButton = page.getByRole("button", { name: /skip to profile/i });
  if (await skipButton.count()) {
    await skipButton.click();
    await page.waitForTimeout(800);
  }

  await page.evaluate(() => {
    document.exitFullscreen?.().catch(() => {});
  });
  await page.waitForTimeout(400);

  const out = [];

  for (const [index, id] of sectionIds.entries()) {
    const node = page.locator(".portfolio-map .map-node").nth(index);
    if (await node.count()) {
      await node.click();
      await page.waitForTimeout(300);
    }

    const report = await page.evaluate((sectionId) => {
      const selectors = [
        ".side-preview-panel",
        ".side-preview-panel > .qd-content",
        ".portfolio-map",
        ".portfolio-map-path",
        ".mq-page",
        ".mq-project-card",
        ".mq-skill-widget",
        ".mq-soft-card",
        ".mq-work-card",
        ".mq-leadership-row",
        ".mq-hobby-card",
        ".mq-achievement-card",
        ".map-node",
      ];

      const details = selectors.flatMap((selector) =>
        Array.from(document.querySelectorAll(selector)).map((el, idx) => {
          const rect = el.getBoundingClientRect();
          const styles = getComputedStyle(el);
          return {
            selector,
            idx,
            text: el.textContent?.trim().slice(0, 80) ?? "",
            rect: {
              x: Math.round(rect.x),
              y: Math.round(rect.y),
              w: Math.round(rect.width),
              h: Math.round(rect.height),
            },
            overflowX: el.scrollWidth - el.clientWidth,
            overflowY: el.scrollHeight - el.clientHeight,
            fontSize: styles.fontSize,
          };
        }),
      );

      return {
        sectionId,
        title: document.querySelector(".side-preview-header h2")?.textContent?.trim(),
        details,
        viewport: { w: innerWidth, h: innerHeight },
      };
    }, id);

    out.push(report);
    await page.screenshot({
      path: `output/playwright/${String(index + 1).padStart(2, "0")}-${id}.png`,
      fullPage: false,
    });
  }

  console.log(JSON.stringify(out.map((section) => ({
    section: section.sectionId,
    title: section.title,
    overflow: section.details
      .filter((item) => item.overflowX > 2 || item.overflowY > 2)
      .map((item) => ({
        selector: item.selector,
        idx: item.idx,
        overflowX: item.overflowX,
        overflowY: item.overflowY,
        fontSize: item.fontSize,
        text: item.text,
      })),
  })), null, 2));
}
