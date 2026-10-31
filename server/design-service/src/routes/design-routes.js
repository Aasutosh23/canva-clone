const express = require("express");
const designController = require("../controllers/design-controller");
const authenticatedRequest = require("../middleware/auth-middleware");

const router = express.Router();

router.use(authenticatedRequest);

router.get("/", designController.getUserDesigns);
router.get("/trash", designController.getTrashedDesigns);
router.get("/:id", designController.getUserDesignsByID);
router.post("/", designController.saveDesign);
router.delete("/:id", designController.deleteDesign);
router.patch("/:id/recover", designController.recoverDesign);
router.delete("/:id/permanent", designController.permanentlyDeleteDesign);

module.exports = router;
