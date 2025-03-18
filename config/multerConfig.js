import multer from "multer";

export const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/public/images");
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + "." + ext;
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

export const fileFilter = (req, file, cb) => {
  const isImage = file.mimetype.split("/")[0];
  if (isImage === "image") {
    return cb(null, true);
  } else {
    const error = new Error("file must be an images ");
    error.statusCode = 400;
    cb(error);
  }
};
