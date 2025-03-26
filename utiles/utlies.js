import path, { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
import fs from "fs/promises";

export const deleteImage = async (imageName) => {
  const fullPath = path.join(
    __dirname,
    "..",
    "public",
    "images",
    imageName.replace("/images/", "")
  );

  try {
    await fs.stat(fullPath);
    await fs.unlink(fullPath);
    console.log("deleted");
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error("not deleted", error);
    } else {
      console.log("image not found", fullPath);
    }
  }
};
