async (page) => {
  return await page.evaluate(async () => {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const selectors = [
      ".slide-page",
      ".slide-page > .qd-content",
      ".mq-page",
      ".mq-project-card",
      ".mq-work-card",
      ".mq-soft-card",
      ".mq-leadership-row",
      ".mq-hobby-card",
      ".mq-achievement-card",
      ".mq-paper-note",
      ".mq-education-card",
      ".mq-fun-fact",
      ".mq-skill-widget",
    ];
    const results = [];

    const expand = document.querySelector('[aria-label="Open fullscreen preview"]');
    if (expand) {
      expand.click();
      await sleep(180);
    }

    for (let i = 0; i < 10; i += 1) {
      const previous = document.querySelector('button[aria-label="Previous slide"]');
      if (!previous || previous.disabled) break;
      previous.click();
      await sleep(90);
    }

    for (let i = 0; i < 8; i += 1) {
      await sleep(90);
      const title = document.querySelector(".slide-header h2, .side-preview-header h2")?.textContent?.trim() || "unknown";
      const problems = [];

      selectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((element, index) => {
          const rect = element.getBoundingClientRect();
          const scrollW = element.scrollWidth - element.clientWidth;
          const scrollH = element.scrollHeight - element.clientHeight;
          if (
            scrollW > 2 ||
            scrollH > 2 ||
            rect.right > window.innerWidth + 2 ||
            rect.bottom > window.innerHeight + 2 ||
            rect.left < -2 ||
            rect.top < -2
          ) {
            problems.push({
              selector,
              index,
              text: (element.textContent || "").trim().slice(0, 90),
              rect: {
                x: Math.round(rect.x),
                y: Math.round(rect.y),
                w: Math.round(rect.width),
                h: Math.round(rect.height),
              },
              scrollW,
              scrollH,
            });
          }
        });
      });

      results.push({
        slide: i + 1,
        title,
        problemCount: problems.length,
        problems: problems.slice(0, 12),
      });

      const next = document.querySelector('button[aria-label="Next slide"]');
      if (!next || next.disabled) break;
      next.click();
    }

    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      results,
    };
  });
}
