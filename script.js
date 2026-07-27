const pageTabs = [...document.querySelectorAll(".page-tab")];
const pagePanels = [...document.querySelectorAll(".page-panel")];
const menuButton = document.querySelector(".menu-button");
const pageTabList = document.querySelector(".page-tabs");

function openPage(pageName, updateHash = true) {
  pageTabs.forEach((tab) => {
    const selected = tab.dataset.page === pageName;
    tab.classList.toggle("active", selected);
    tab.setAttribute("aria-selected", String(selected));
  });
  pagePanels.forEach((panel) => {
    const selected = panel.id === `page-${pageName}`;
    panel.hidden = !selected;
    panel.classList.toggle("active", selected);
  });
  pageTabList.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
  if (updateHash) history.replaceState(null, "", `#${pageName}`);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

pageTabs.forEach((tab) => tab.addEventListener("click", () => openPage(tab.dataset.page)));
menuButton.addEventListener("click", () => {
  const open = !pageTabList.classList.contains("open");
  pageTabList.classList.toggle("open", open);
  menuButton.setAttribute("aria-expanded", String(open));
});

const stepTabs = [...document.querySelectorAll(".step-tab")];
const stepPanels = [...document.querySelectorAll(".step-panel")];
stepTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    stepTabs.forEach((item) => {
      const selected = item === tab;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-selected", String(selected));
    });
    stepPanels.forEach((panel) => {
      const selected = panel.id === `step-${tab.dataset.step}`;
      panel.hidden = !selected;
      panel.classList.toggle("active", selected);
    });
  });
});

const dialog = document.querySelector(".image-dialog");
const dialogImage = dialog.querySelector("img");
document.querySelectorAll(".image-button").forEach((button) => {
  button.addEventListener("click", () => {
    dialogImage.src = button.dataset.image;
    dialogImage.alt = button.querySelector("img").alt;
    dialog.showModal();
  });
});
dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

const requestedPage = location.hash.slice(1);
if (pageTabs.some((tab) => tab.dataset.page === requestedPage)) openPage(requestedPage, false);

const inventionPage = document.querySelector("#page-invention");
const annotationArea = inventionPage.querySelector(".parallel-texts");
const toolButtons = [...inventionPage.querySelectorAll(".tool-button")];
const toolStatus = inventionPage.querySelector(".tool-status");
let activeTool = "highlight";
let activeColor = "yellow";
let savedRange = null;

function toolName() {
  if (activeTool === "eraser") return "橡皮擦";
  if (activeTool === "underline") return "畫底線";
  return `${activeColor === "yellow" ? "黃色" : activeColor === "green" ? "綠色" : "粉色"}螢光筆`;
}

function updateToolState(activeButton) {
  toolButtons.forEach((button) => {
    const selected = button === activeButton;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  inventionPage.classList.toggle("eraser-active", activeTool === "eraser");
  toolStatus.textContent = `目前文具：${toolName()}`;
}

document.addEventListener("selectionchange", () => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
  const range = selection.getRangeAt(0);
  if (annotationArea.contains(range.commonAncestorContainer)) savedRange = range.cloneRange();
});

toolButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeTool = button.dataset.tool;
    activeColor = button.dataset.color || activeColor;
    updateToolState(button);
    if (activeTool === "eraser") return;
    if (!savedRange || !annotationArea.contains(savedRange.commonAncestorContainer)) {
      toolStatus.textContent = "請先選取要畫記的課文文字。";
      return;
    }
    const mark = document.createElement("mark");
    mark.className = "reader-mark";
    mark.dataset.tool = activeTool;
    if (activeTool === "highlight") mark.dataset.color = activeColor;
    try {
      mark.appendChild(savedRange.extractContents());
      savedRange.insertNode(mark);
      window.getSelection().removeAllRanges();
      savedRange = null;
      toolStatus.textContent = `已使用${toolName()}完成畫記。`;
    } catch {
      toolStatus.textContent = "這段文字跨越多個區塊，請縮短選取範圍後再試一次。";
    }
  });
});

annotationArea.addEventListener("click", (event) => {
  if (activeTool !== "eraser") return;
  const mark = event.target.closest(".reader-mark");
  if (!mark) return;
  mark.replaceWith(...mark.childNodes);
  toolStatus.textContent = "已擦除這一處畫記。";
});

inventionPage.querySelector(".clear-annotations").addEventListener("click", () => {
  annotationArea.querySelectorAll(".reader-mark").forEach((mark) => mark.replaceWith(...mark.childNodes));
  toolStatus.textContent = "已清除全部畫記。";
});
