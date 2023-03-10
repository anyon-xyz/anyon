import { createCanvas, loadImage } from "canvas";

export const genItemImage = async (
  itemImagePath: string,
  stickersImagePath: string[]
) => {
  const itemImg = await loadImage(itemImagePath);

  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext("2d");

  const dx = canvas.width / 2 - itemImg.width / 2;
  const dy = canvas.height / 2 - itemImg.height / 2 - 50;

  ctx.drawImage(itemImg, dx, dy);

  if (stickersImagePath.length > 0) {
    const loadStickersImage = stickersImagePath.map((path) => loadImage(path));

    const stickersImage = await Promise.all(loadStickersImage);

    stickersImage.forEach((image, i) => {
      const currentX = i > 0 ? i * 125 + dx : dx;
      ctx.drawImage(image, currentX, itemImg.height + 35, 180, 150);
    });

    // fs.writeFileSync("./generated/dragon-lore.png", canvas.toBuffer("image/png"));
  }

  return canvas.toBuffer("image/png");
};

// genImage(
//   "https://api.steamapis.com/image/item/730/AWP | Dragon Lore (Field-Tested)",
//   [
//     "https://api.steamapis.com/image/item/730/Sticker | shox | Antwerp 2022",
//     "https://api.steamapis.com/image/item/730/Sticker | shox | Antwerp 2022",
//     "https://api.steamapis.com/image/item/730/Sticker | shox | Antwerp 2022",
//     "https://api.steamapis.com/image/item/730/Sticker | shox | Antwerp 2022",
//   ]
// )
